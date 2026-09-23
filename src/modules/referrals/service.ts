import "server-only";

import { randomBytes } from "node:crypto";

import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { env } from "@/config/env";
import { db } from "@/db/client";
import {
  auditLogs,
  invoiceRecords,
  referrals,
  referralCodes,
  salesLeads,
  subscriptions,
  tenants,
} from "@/db/schema";
import { createId } from "@/lib/ids";

export const REFERRAL_TERMS_VERSION = "recommendation-v1";
export const REFERRAL_MIN_ACTIVE_DAYS = 30;

function referralCode() {
  return randomBytes(18).toString("base64url");
}

export async function findPublicReferral(code: string) {
  const normalized = z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{20,48}$/)
    .parse(code);
  const [row] = await db
    .select({ code: referralCodes.code })
    .from(referralCodes)
    .innerJoin(tenants, eq(tenants.id, referralCodes.tenantId))
    .where(
      and(
        eq(referralCodes.code, normalized),
        eq(referralCodes.active, true),
        eq(tenants.status, "active"),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function findTenantReferralProgram(tenantId: string) {
  z.string().uuid().parse(tenantId);
  const [code, referralRows] = await Promise.all([
    db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.tenantId, tenantId))
      .limit(1),
    db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerTenantId, tenantId))
      .orderBy(desc(referrals.createdAt)),
  ]);
  const activeCode = code[0] ?? null;
  return {
    code: activeCode,
    shareUrl: activeCode
      ? new URL(`/empfehlung/${activeCode.code}`, env.APP_BASE_URL).toString()
      : null,
    referrals: referralRows,
    availableCreditCents: referralRows
      .filter((entry) => entry.status === "qualified")
      .reduce((sum, entry) => sum + (entry.rewardCentsSnapshot ?? 0), 0),
    creditedCents: referralRows
      .filter((entry) => entry.status === "credited")
      .reduce((sum, entry) => sum + (entry.rewardCentsSnapshot ?? 0), 0),
  };
}

export async function activateTenantReferralProgram(input: {
  tenantId: string;
  actorUserId: string;
}) {
  const parsed = z
    .object({ tenantId: z.string().uuid(), actorUserId: z.string().uuid() })
    .parse(input);
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.tenantId, parsed.tenantId))
      .limit(1);
    if (existing) {
      if (!existing.active)
        await tx
          .update(referralCodes)
          .set({ active: true, termsVersion: REFERRAL_TERMS_VERSION })
          .where(eq(referralCodes.id, existing.id));
      return existing.code;
    }
    const [tenant] = await tx
      .select({ id: tenants.id })
      .from(tenants)
      .where(and(eq(tenants.id, parsed.tenantId), eq(tenants.status, "active")))
      .limit(1);
    if (!tenant) throw new Error("Aktiver Mandant wurde nicht gefunden.");
    const code = referralCode();
    await tx.insert(referralCodes).values({
      id: createId(),
      tenantId: parsed.tenantId,
      code,
      termsVersion: REFERRAL_TERMS_VERSION,
    });
    await tx.insert(auditLogs).values({
      id: createId(),
      tenantId: parsed.tenantId,
      actorUserId: parsed.actorUserId,
      action: "referral.program.activated",
      entityType: "referral_code",
      metadata: { termsVersion: REFERRAL_TERMS_VERSION },
    });
    return code;
  });
}

export async function setTenantReferralProgramActive(input: {
  tenantId: string;
  active: boolean;
  actorUserId: string;
}) {
  const parsed = z
    .object({
      tenantId: z.string().uuid(),
      active: z.boolean(),
      actorUserId: z.string().uuid(),
    })
    .parse(input);
  await db.transaction(async (tx) => {
    const result = await tx
      .update(referralCodes)
      .set({ active: parsed.active })
      .where(eq(referralCodes.tenantId, parsed.tenantId));
    if (result[0].affectedRows !== 1)
      throw new Error("Empfehlungsprogramm wurde nicht gefunden.");
    await tx.insert(auditLogs).values({
      id: createId(),
      tenantId: parsed.tenantId,
      actorUserId: parsed.actorUserId,
      action: parsed.active
        ? "referral.program.activated"
        : "referral.program.paused",
      entityType: "referral_code",
    });
  });
}

export async function recordLeadReferral(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  input: {
    leadId: string;
    code: string;
    disclosureAccepted: boolean;
    disclosureVersion: string;
    confirmedAt: Date;
  },
) {
  const parsed = z
    .object({
      leadId: z.string().uuid(),
      code: z.string().regex(/^[A-Za-z0-9_-]{20,48}$/),
      disclosureAccepted: z.literal(true),
      disclosureVersion: z.literal(REFERRAL_TERMS_VERSION),
      confirmedAt: z.date(),
    })
    .parse(input);
  const [code] = await tx
    .select({ id: referralCodes.id, tenantId: referralCodes.tenantId })
    .from(referralCodes)
    .innerJoin(tenants, eq(tenants.id, referralCodes.tenantId))
    .where(
      and(
        eq(referralCodes.code, parsed.code),
        eq(referralCodes.active, true),
        eq(tenants.status, "active"),
      ),
    )
    .limit(1);
  if (!code) throw new Error("Der Empfehlungslink ist nicht mehr gültig.");
  await tx.insert(referrals).values({
    id: createId(),
    referralCodeId: code.id,
    referrerTenantId: code.tenantId,
    referredLeadId: parsed.leadId,
    termsVersion: parsed.disclosureVersion,
    disclosureConfirmedAt: parsed.confirmedAt,
  });
}

export async function linkReferralToTenant(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  input: { leadId: string; tenantId: string; startsAt: Date },
) {
  const eligibleAt = new Date(
    input.startsAt.getTime() + REFERRAL_MIN_ACTIVE_DAYS * 24 * 60 * 60_000,
  );
  await tx
    .update(referrals)
    .set({
      referredTenantId: input.tenantId,
      status: "awaiting_eligibility",
      eligibleAt,
    })
    .where(
      and(
        eq(referrals.referredLeadId, input.leadId),
        eq(referrals.status, "pending"),
      ),
    );
}

export async function listPlatformReferrals() {
  const rows = await db
    .select()
    .from(referrals)
    .orderBy(desc(referrals.createdAt));
  if (!rows.length) return [];
  const tenantIds = [
    ...new Set(
      rows.flatMap((row) =>
        [row.referrerTenantId, row.referredTenantId].filter(
          (value): value is string => Boolean(value),
        ),
      ),
    ),
  ];
  const leadIds = rows.map((row) => row.referredLeadId);
  const invoiceIds = rows
    .map((row) => row.creditedInvoiceId)
    .filter((value): value is string => Boolean(value));
  const [tenantRows, leadRows, invoiceRows, availableInvoiceRows] =
    await Promise.all([
      db
        .select({ id: tenants.id, name: tenants.name })
        .from(tenants)
        .where(inArray(tenants.id, tenantIds)),
      db
        .select({ id: salesLeads.id, companyName: salesLeads.companyName })
        .from(salesLeads)
        .where(inArray(salesLeads.id, leadIds)),
      invoiceIds.length
        ? db
            .select({
              id: invoiceRecords.id,
              invoiceNumber: invoiceRecords.invoiceNumber,
            })
            .from(invoiceRecords)
            .where(inArray(invoiceRecords.id, invoiceIds))
        : Promise.resolve([]),
      db
        .select({
          id: invoiceRecords.id,
          tenantId: invoiceRecords.tenantId,
          invoiceNumber: invoiceRecords.invoiceNumber,
          grossAmountCents: invoiceRecords.grossAmountCents,
          issuedAt: invoiceRecords.issuedAt,
        })
        .from(invoiceRecords)
        .where(inArray(invoiceRecords.tenantId, tenantIds))
        .orderBy(desc(invoiceRecords.issuedAt)),
    ]);
  const tenantNames = new Map(tenantRows.map((row) => [row.id, row.name]));
  const leadNames = new Map(leadRows.map((row) => [row.id, row.companyName]));
  const invoiceNumbers = new Map(
    invoiceRows.map((row) => [row.id, row.invoiceNumber]),
  );
  return rows.map((row) => ({
    ...row,
    referrerName: tenantNames.get(row.referrerTenantId) ?? "Unbekannt",
    referredName:
      (row.referredTenantId && tenantNames.get(row.referredTenantId)) ||
      leadNames.get(row.referredLeadId) ||
      "Unbekannt",
    creditedInvoiceNumber: row.creditedInvoiceId
      ? (invoiceNumbers.get(row.creditedInvoiceId) ?? null)
      : null,
    invoiceOptions: availableInvoiceRows.filter(
      (invoice) => invoice.tenantId === row.referrerTenantId,
    ),
  }));
}

export async function qualifyReferral(input: {
  referralId: string;
  actorUserId: string;
}) {
  const parsed = z
    .object({ referralId: z.string().uuid(), actorUserId: z.string().uuid() })
    .parse(input);
  await db.transaction(async (tx) => {
    const [referral] = await tx
      .select()
      .from(referrals)
      .where(eq(referrals.id, parsed.referralId))
      .limit(1)
      .for("update");
    if (!referral || referral.status !== "awaiting_eligibility")
      throw new Error("Die Empfehlung wartet nicht auf eine Freigabe.");
    if (!referral.referredTenantId || !referral.eligibleAt)
      throw new Error(
        "Die geworbene Kundeninstanz ist noch nicht vollständig.",
      );
    if (referral.referrerTenantId === referral.referredTenantId)
      throw new Error("Eigenempfehlungen sind ausgeschlossen.");
    if (referral.eligibleAt > new Date())
      throw new Error(
        `Die 30-tägige Aktivitätsfrist endet am ${referral.eligibleAt.toLocaleDateString("de-DE")}.`,
      );
    const [paidInvoice] = await tx
      .select({ id: invoiceRecords.id })
      .from(invoiceRecords)
      .where(
        and(
          eq(invoiceRecords.tenantId, referral.referredTenantId),
          eq(invoiceRecords.status, "paid"),
        ),
      )
      .limit(1);
    const [referrerSubscription] = await tx
      .select({ monthlyPriceCents: subscriptions.monthlyPriceCentsSnapshot })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.tenantId, referral.referrerTenantId),
          eq(subscriptions.status, "active"),
        ),
      )
      .limit(1);
    const [referredTenant] = await tx
      .select({ status: tenants.status })
      .from(tenants)
      .where(eq(tenants.id, referral.referredTenantId))
      .limit(1);
    if (!paidInvoice)
      throw new Error(
        "Die erste Rechnung des geworbenen Kunden ist noch nicht als bezahlt dokumentiert.",
      );
    if (referredTenant?.status !== "active")
      throw new Error("Der geworbene Kunde ist nicht aktiv.");
    const rewardCents = referrerSubscription?.monthlyPriceCents;
    if (!rewardCents || rewardCents <= 0)
      throw new Error(
        "Für den werbenden Kunden fehlt ein gültiger Monatspreis.",
      );
    const result = await tx
      .update(referrals)
      .set({
        status: "qualified",
        qualifiedAt: new Date(),
        rewardCentsSnapshot: rewardCents,
        reviewedByUserId: parsed.actorUserId,
      })
      .where(
        and(
          eq(referrals.id, referral.id),
          eq(referrals.status, "awaiting_eligibility"),
        ),
      );
    if (result[0].affectedRows !== 1)
      throw new Error("Die Empfehlung wurde bereits parallel bearbeitet.");
    await tx.insert(auditLogs).values({
      id: createId(),
      tenantId: referral.referrerTenantId,
      actorUserId: parsed.actorUserId,
      action: "referral.qualified",
      entityType: "referral",
      entityId: referral.id,
      metadata: { rewardCents },
    });
  });
}

export async function rejectReferral(input: {
  referralId: string;
  reason: string;
  actorUserId: string;
}) {
  const parsed = z
    .object({
      referralId: z.string().uuid(),
      reason: z.string().trim().min(5).max(500),
      actorUserId: z.string().uuid(),
    })
    .parse(input);
  await db.transaction(async (tx) => {
    const [referral] = await tx
      .select()
      .from(referrals)
      .where(eq(referrals.id, parsed.referralId))
      .limit(1)
      .for("update");
    if (
      !referral ||
      !["pending", "awaiting_eligibility"].includes(referral.status)
    )
      throw new Error("Diese Empfehlung kann nicht mehr abgelehnt werden.");
    await tx
      .update(referrals)
      .set({
        status: "rejected",
        rejectedAt: new Date(),
        rejectionReason: parsed.reason,
        reviewedByUserId: parsed.actorUserId,
      })
      .where(eq(referrals.id, referral.id));
    await tx.insert(auditLogs).values({
      id: createId(),
      tenantId: referral.referrerTenantId,
      actorUserId: parsed.actorUserId,
      action: "referral.rejected",
      entityType: "referral",
      entityId: referral.id,
      metadata: { reason: parsed.reason },
    });
  });
}

export async function creditReferral(input: {
  referralId: string;
  invoiceId: string;
  accountableConfirmed: boolean;
  actorUserId: string;
}) {
  const parsed = z
    .object({
      referralId: z.string().uuid(),
      invoiceId: z.string().uuid(),
      accountableConfirmed: z.literal(true),
      actorUserId: z.string().uuid(),
    })
    .parse(input);
  await db.transaction(async (tx) => {
    const [referral] = await tx
      .select()
      .from(referrals)
      .where(eq(referrals.id, parsed.referralId))
      .limit(1)
      .for("update");
    if (
      !referral ||
      referral.status !== "qualified" ||
      !referral.rewardCentsSnapshot
    )
      throw new Error("Diese Empfehlung besitzt keine offene Gutschrift.");
    const [invoice] = await tx
      .select()
      .from(invoiceRecords)
      .where(
        and(
          eq(invoiceRecords.id, parsed.invoiceId),
          eq(invoiceRecords.tenantId, referral.referrerTenantId),
        ),
      )
      .limit(1);
    if (!invoice || invoice.status === "cancelled")
      throw new Error(
        "Es wird eine nicht stornierte Accountable-Rechnung des werbenden Kunden benötigt.",
      );
    const result = await tx
      .update(referrals)
      .set({
        status: "credited",
        creditedAt: new Date(),
        creditedInvoiceId: invoice.id,
        reviewedByUserId: parsed.actorUserId,
      })
      .where(
        and(eq(referrals.id, referral.id), eq(referrals.status, "qualified")),
      );
    if (result[0].affectedRows !== 1)
      throw new Error("Die Gutschrift wurde bereits parallel verbucht.");
    await tx.insert(auditLogs).values({
      id: createId(),
      tenantId: referral.referrerTenantId,
      actorUserId: parsed.actorUserId,
      action: "referral.credited",
      entityType: "referral",
      entityId: referral.id,
      metadata: {
        rewardCents: referral.rewardCentsSnapshot,
        invoiceNumber: invoice.invoiceNumber,
        externalReference: invoice.externalReference,
      },
    });
  });
}
