import "server-only";

import { asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import {
  auditLogs,
  featureFlags,
  planFeatures,
  plans,
  subscriptions,
} from "@/db/schema";
import { createId } from "@/lib/ids";
import { featureCatalog, type FeatureKey } from "@/modules/features/catalog";
import { priceToCents } from "./pricing";
import { calculateBillingSnapshot } from "@/modules/billing/intervals";

const planInputSchema = z.object({
  id: z.string().uuid().optional(),
  publicName: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(1_000),
  monthlyPrice: z.string().trim().max(20),
  setupPrice: z.string().trim().max(20),
  annualBillingEnabled: z.boolean(),
  annualDiscountPercent: z.coerce.number().min(0).max(50),
  minimumTermMonths: z.coerce.number().int().min(1).max(24),
  position: z.coerce.number().int().min(0).max(2),
  highlighted: z.boolean(),
  active: z.boolean(),
  includedFeatures: z.array(
    z.enum(Object.keys(featureCatalog) as [FeatureKey, ...FeatureKey[]]),
  ),
});

export type PlanInput = z.infer<typeof planInputSchema>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function listPlatformPlans() {
  const planRows = await db.select().from(plans).orderBy(asc(plans.position));
  if (planRows.length === 0) return [];
  const includedRows = await db
    .select({ planId: planFeatures.planId, featureKey: featureFlags.key })
    .from(planFeatures)
    .innerJoin(featureFlags, eq(featureFlags.id, planFeatures.featureId))
    .where(
      inArray(
        planFeatures.planId,
        planRows.map((plan) => plan.id),
      ),
    );
  return planRows.map((plan) => ({
    ...plan,
    includedFeatures: includedRows
      .filter((row) => row.planId === plan.id)
      .map((row) => row.featureKey as FeatureKey),
  }));
}

async function ensureFeatureFlags(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
) {
  const rows = await tx.select().from(featureFlags);
  const existing = new Map(rows.map((row) => [row.key, row]));
  for (const [key, feature] of Object.entries(featureCatalog)) {
    if (existing.has(key)) continue;
    await tx.insert(featureFlags).values({
      id: createId(),
      key,
      title: feature.title,
      description: feature.description,
      defaultStatus:
        feature.availability === "available" ? "unavailable" : "coming_soon",
    });
  }
  return tx.select().from(featureFlags);
}

export async function savePlatformPlan(raw: PlanInput) {
  const input = planInputSchema.parse(raw);
  if (
    input.includedFeatures.some(
      (key) => featureCatalog[key].availability !== "available",
    )
  )
    throw new Error(
      "Geplante Module können noch nicht als enthaltene Leistung gespeichert werden.",
    );
  const monthlyPriceCents = priceToCents(input.monthlyPrice);
  const setupPriceCents = priceToCents(input.setupPrice);
  const annualDiscountBasisPoints = Math.round(
    input.annualDiscountPercent * 100,
  );

  return db.transaction(async (tx) => {
    const currentPlans = await tx.select({ id: plans.id }).from(plans);
    if (!input.id && currentPlans.length >= 3)
      throw new Error("Es können höchstens drei Pakete angeboten werden.");
    if (input.id && !currentPlans.some((plan) => plan.id === input.id))
      throw new Error("Das Paket wurde nicht gefunden.");

    const id = input.id ?? createId();
    const values = {
      publicName: input.publicName,
      internalName: input.publicName,
      description: input.description,
      monthlyPriceCents,
      setupPriceCents,
      annualBillingEnabled: input.annualBillingEnabled,
      annualDiscountBasisPoints,
      minimumTermMonths: input.minimumTermMonths,
      position: input.position,
      highlighted: input.highlighted,
      active: input.active,
    };
    if (input.id) {
      await tx.update(plans).set(values).where(eq(plans.id, id));
      await tx.delete(planFeatures).where(eq(planFeatures.planId, id));
    } else {
      await tx.insert(plans).values({
        id,
        key: `${slugify(input.publicName) || "paket"}-${id.slice(0, 8)}`,
        ...values,
      });
    }

    const flags = await ensureFeatureFlags(tx);
    const included = flags.filter((flag) =>
      input.includedFeatures.includes(flag.key as FeatureKey),
    );
    if (included.length > 0) {
      await tx.insert(planFeatures).values(
        included.map((flag) => ({
          planId: id,
          featureId: flag.id,
          status: "enabled" as const,
        })),
      );
    }
    return id;
  });
}

export async function updateAddonPrice(input: {
  featureKey: FeatureKey;
  available: boolean;
  price: string;
}) {
  const featureDefinition = featureCatalog[input.featureKey];
  if (!featureDefinition) throw new Error("Modul nicht gefunden.");
  if (featureDefinition.availability !== "available")
    throw new Error(
      "Geplante Module können erst nach ihrer technischen Freigabe verkauft werden.",
    );
  const price = priceToCents(input.price);
  await db.transaction(async (tx) => {
    const flags = await ensureFeatureFlags(tx);
    const feature = flags.find((row) => row.key === input.featureKey);
    if (!feature) throw new Error("Modul nicht gefunden.");
    await tx
      .update(featureFlags)
      .set({
        addonAvailable: input.available,
        addonPriceCents: input.available ? price : null,
      })
      .where(eq(featureFlags.id, feature.id));
  });
}

export async function listSellableAddons() {
  return db.select().from(featureFlags).orderBy(asc(featureFlags.title));
}

export async function assignTenantPlan(input: {
  tenantId: string;
  planId: string;
  billingIntervalMonths: number;
  actorUserId: string;
}) {
  await db.transaction(async (tx) => {
    const [plan] = await tx
      .select({
        id: plans.id,
        publicName: plans.publicName,
        monthlyPriceCents: plans.monthlyPriceCents,
        setupPriceCents: plans.setupPriceCents,
        annualBillingEnabled: plans.annualBillingEnabled,
        annualDiscountBasisPoints: plans.annualDiscountBasisPoints,
        minimumTermMonths: plans.minimumTermMonths,
      })
      .from(plans)
      .where(eq(plans.id, input.planId))
      .limit(1);
    if (!plan) throw new Error("Paket wurde nicht gefunden.");
    const billing = calculateBillingSnapshot(plan, input.billingIntervalMonths);
    await tx
      .update(subscriptions)
      .set({ status: "replaced", endsAt: new Date() })
      .where(eq(subscriptions.tenantId, input.tenantId));
    await tx.insert(subscriptions).values({
      id: createId(),
      tenantId: input.tenantId,
      planId: input.planId,
      planNameSnapshot: plan.publicName,
      monthlyPriceCentsSnapshot: plan.monthlyPriceCents,
      setupPriceCentsSnapshot: plan.setupPriceCents,
      billingAmountCentsSnapshot: billing.billingAmountCentsSnapshot,
      billingIntervalMonths: billing.billingIntervalMonths,
      discountBasisPointsSnapshot: billing.discountBasisPointsSnapshot,
      minimumTermMonths: plan.minimumTermMonths,
      cancellationNoticeMonthsSnapshot: 1,
      renewsIndefinitelySnapshot: true,
      status: "active",
    });
    await tx.insert(auditLogs).values({
      id: createId(),
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: "tenant.plan.assigned",
      entityType: "subscription",
      metadata: {
        planId: plan.id,
        planName: plan.publicName,
        monthlyPriceCents: plan.monthlyPriceCents,
        setupPriceCents: plan.setupPriceCents,
        billingIntervalMonths: billing.billingIntervalMonths,
        billingAmountCents: billing.billingAmountCentsSnapshot,
        discountBasisPoints: billing.discountBasisPointsSnapshot,
        minimumTermMonths: plan.minimumTermMonths,
        cancellationNoticeMonths: 1,
        renewsIndefinitely: true,
      },
    });
  });
}
