import "server-only";

import { and, asc, desc, eq, inArray, isNull, like } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import {
  backgroundJobs,
  postalDispatches,
  salesActivities,
  salesLeads,
  salesNewsletterRecipients,
  tenantOnboardingTokens,
} from "@/db/schema";
import { createId } from "@/lib/ids";
import { getMediaStorage } from "@/modules/media/runtime-storage";
import { salesStages, type LeadStatus } from "./sales-stages";
import type { SalesCsvRow } from "./sales-csv";

const createLeadSchema = z.object({
  companyName: z.string().trim().min(2).max(180),
  contactName: z.string().trim().max(160),
  email: z.union([z.literal(""), z.email()]),
  phone: z.string().trim().max(40),
  website: z.union([z.literal(""), z.url()]),
  street: z.string().trim().max(180),
  postalCode: z.string().trim().max(20),
  city: z.string().trim().max(120),
  country: z.string().trim().min(2).max(120),
  note: z.string().trim().max(3_000),
  nextTaskAt: z.string().trim(),
  emailPermission: z.enum(["unknown", "consent", "existing_customer"]),
  emailPermissionEvidence: z.string().trim().max(2_000),
});

const emailPermissionSchema = z.enum([
  "unknown",
  "consent",
  "existing_customer",
  "withdrawn",
]);

function parseTaskDate(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    throw new Error("Die Wiedervorlage ist ungültig.");
  return date;
}

export async function listSalesPipeline() {
  const [leads, activities, outreachJobs] = await Promise.all([
    db
      .select()
      .from(salesLeads)
      .orderBy(asc(salesLeads.status), desc(salesLeads.updatedAt)),
    db.select().from(salesActivities).orderBy(desc(salesActivities.createdAt)),
    db
      .select({
        idempotencyKey: backgroundJobs.idempotencyKey,
        status: backgroundJobs.status,
        lastErrorCode: backgroundJobs.lastErrorCode,
        completedAt: backgroundJobs.completedAt,
      })
      .from(backgroundJobs)
      .where(like(backgroundJobs.idempotencyKey, "sales:%"))
      .orderBy(desc(backgroundJobs.updatedAt)),
  ]);
  const latestByLead = new Map<string, (typeof activities)[number]>();
  for (const activity of activities) {
    if (!latestByLead.has(activity.leadId))
      latestByLead.set(activity.leadId, activity);
  }
  const latestOutreachByLead = new Map<string, (typeof outreachJobs)[number]>();
  for (const job of outreachJobs) {
    const leadId = job.idempotencyKey.split(":")[1];
    if (leadId && !latestOutreachByLead.has(leadId))
      latestOutreachByLead.set(leadId, job);
  }
  return leads.map((lead) => ({
    ...lead,
    latestActivity: latestByLead.get(lead.id) ?? null,
    latestOutreach: latestOutreachByLead.get(lead.id) ?? null,
  }));
}

export async function findSalesLeadForInstance(id: string) {
  const leadId = z.uuid().parse(id);
  const [lead] = await db
    .select({
      id: salesLeads.id,
      companyName: salesLeads.companyName,
      contactName: salesLeads.contactName,
      email: salesLeads.email,
      phone: salesLeads.phone,
      website: salesLeads.website,
      convertedTenantId: salesLeads.convertedTenantId,
    })
    .from(salesLeads)
    .where(eq(salesLeads.id, leadId))
    .limit(1);
  return lead ?? null;
}

export async function findSalesLeadDetail(id: string) {
  const leadId = z.uuid().parse(id);
  const [lead] = await db
    .select()
    .from(salesLeads)
    .where(eq(salesLeads.id, leadId))
    .limit(1);
  if (!lead) return null;
  const activities = await db
    .select()
    .from(salesActivities)
    .where(eq(salesActivities.leadId, leadId))
    .orderBy(desc(salesActivities.createdAt));
  return { ...lead, activities };
}

export async function createManualLead(raw: unknown, actorUserId: string) {
  const input = createLeadSchema.parse(raw);
  if (
    ["consent", "existing_customer"].includes(input.emailPermission) &&
    input.emailPermissionEvidence.length < 10
  )
    throw new Error(
      "Bitte dokumentiere Quelle und Zeitpunkt der E-Mail-Freigabe nachvollziehbar.",
    );
  const id = createId();
  await db.transaction(async (tx) => {
    await tx.insert(salesLeads).values({
      id,
      companyName: input.companyName,
      contactName: input.contactName || null,
      email: input.email || null,
      phone: input.phone || null,
      website: input.website || null,
      street: input.street || null,
      postalCode: input.postalCode || null,
      city: input.city || null,
      country: input.country,
      source: "manual",
      status: "new",
      ownerUserId: actorUserId,
      nextTaskAt: parseTaskDate(input.nextTaskAt),
      emailPermission: input.emailPermission,
      emailPermissionEvidence: input.emailPermissionEvidence || null,
      emailPermissionAt:
        input.emailPermission === "unknown" ? null : new Date(),
    });
    if (input.note) {
      await tx.insert(salesActivities).values({
        id: createId(),
        leadId: id,
        actorUserId,
        activityType: "note",
        note: input.note,
      });
    }
  });
  return id;
}

export async function updateLead(input: {
  id: string;
  status: LeadStatus;
  nextTaskAt: string;
  note: string;
  actorUserId: string;
  emailPermission: string;
  emailPermissionEvidence: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
}) {
  const status = z.enum(salesStages).parse(input.status);
  const note = z.string().trim().max(3_000).parse(input.note);
  const emailPermission = emailPermissionSchema.parse(input.emailPermission);
  const emailPermissionEvidence = z
    .string()
    .trim()
    .max(2_000)
    .parse(input.emailPermissionEvidence);
  const address = z
    .object({
      street: z.string().trim().max(180),
      postalCode: z.string().trim().max(20),
      city: z.string().trim().max(120),
      country: z.string().trim().min(2).max(120),
    })
    .parse(input);
  if (
    ["consent", "existing_customer"].includes(emailPermission) &&
    emailPermissionEvidence.length < 10
  )
    throw new Error(
      "Bitte dokumentiere Quelle und Zeitpunkt der E-Mail-Freigabe nachvollziehbar.",
    );
  await db.transaction(async (tx) => {
    const existing = await tx
      .select({
        id: salesLeads.id,
        emailOptOutAt: salesLeads.emailOptOutAt,
      })
      .from(salesLeads)
      .where(eq(salesLeads.id, input.id))
      .limit(1);
    if (!existing[0]) throw new Error("Die Kundenakte wurde nicht gefunden.");
    if (existing[0].emailOptOutAt && emailPermission !== "withdrawn")
      throw new Error(
        "Die Abmeldung ist dauerhaft gesperrt und kann nicht über die Bearbeitung aufgehoben werden.",
      );
    await tx
      .update(salesLeads)
      .set({
        status,
        nextTaskAt: parseTaskDate(input.nextTaskAt),
        emailPermission,
        emailPermissionEvidence: emailPermissionEvidence || null,
        emailPermissionAt:
          emailPermission === "unknown" || emailPermission === "withdrawn"
            ? null
            : new Date(),
        emailOptOutAt: emailPermission === "withdrawn" ? new Date() : null,
        street: address.street || null,
        postalCode: address.postalCode || null,
        city: address.city || null,
        country: address.country,
      })
      .where(eq(salesLeads.id, input.id));
    if (emailPermission === "withdrawn") {
      const queuedNewsletterJobs = await tx
        .select({ jobId: salesNewsletterRecipients.jobId })
        .from(salesNewsletterRecipients)
        .innerJoin(
          backgroundJobs,
          eq(backgroundJobs.id, salesNewsletterRecipients.jobId),
        )
        .where(
          and(
            eq(salesNewsletterRecipients.leadId, input.id),
            inArray(backgroundJobs.status, ["pending", "retry"]),
          ),
        );
      if (queuedNewsletterJobs.length) {
        await tx
          .update(backgroundJobs)
          .set({
            status: "failed",
            lastErrorCode: "recipient_opted_out",
            lockedAt: null,
          })
          .where(
            inArray(
              backgroundJobs.id,
              queuedNewsletterJobs.map((job) => job.jobId),
            ),
          );
      }
    }
    if (note) {
      await tx.insert(salesActivities).values({
        id: createId(),
        leadId: input.id,
        actorUserId: input.actorUserId,
        activityType: "note",
        note,
      });
    }
  });
}

export async function deleteSalesLead(input: {
  id: string;
  confirmation: string;
}) {
  const id = z.uuid().parse(input.id);
  const result = await db.transaction(async (tx) => {
    const [lead] = await tx
      .select({
        companyName: salesLeads.companyName,
        convertedTenantId: salesLeads.convertedTenantId,
      })
      .from(salesLeads)
      .where(eq(salesLeads.id, id))
      .limit(1);
    if (!lead) throw new Error("Der Akquise-Kontakt wurde nicht gefunden.");
    if (lead.convertedTenantId)
      throw new Error(
        "Dieser Lead gehört zu einer Kundenakte und darf nicht gelöscht werden.",
      );
    const [pendingSetup] = await tx
      .select({ id: tenantOnboardingTokens.id })
      .from(tenantOnboardingTokens)
      .where(
        and(
          eq(tenantOnboardingTokens.leadId, id),
          isNull(tenantOnboardingTokens.usedAt),
        ),
      )
      .limit(1);
    if (pendingSetup)
      throw new Error(
        "Für diesen Lead läuft eine Instanzeinrichtung. Storniere zuerst den Einrichtungslink.",
      );
    if (input.confirmation.trim() !== lead.companyName)
      throw new Error("Der eingegebene Name stimmt nicht überein.");
    const dispatches = await tx
      .select({
        status: postalDispatches.status,
        storageKey: postalDispatches.storageKey,
      })
      .from(postalDispatches)
      .where(eq(postalDispatches.leadId, id));
    if (dispatches.some((dispatch) => dispatch.status === "submitted"))
      throw new Error(
        "Mindestens ein Brief wurde an OnlineBrief24 übertragen. Lösche oder storniere diesen Auftrag zuerst unter Briefakquise.",
      );

    // Versandjobs enthalten keinen Fremdschlüssel zum Lead. Sie werden deshalb
    // vor dem Kontakt entfernt; Zustellnachweise hängen daran und folgen per CASCADE.
    await tx
      .delete(backgroundJobs)
      .where(like(backgroundJobs.idempotencyKey, `sales:${id}:%`));
    await tx.delete(salesLeads).where(eq(salesLeads.id, id));
    return {
      companyName: lead.companyName,
      storageKeys: dispatches.map((dispatch) => dispatch.storageKey),
    };
  });
  const cleanup = await Promise.allSettled(
    result.storageKeys.map((storageKey) =>
      getMediaStorage().delete(storageKey),
    ),
  );
  return {
    companyName: result.companyName,
    mediaCleanupFailed: cleanup.filter((item) => item.status === "rejected")
      .length,
  };
}

export async function importSalesLeads(
  rows: SalesCsvRow[],
  actorUserId: string,
) {
  const existing = await db
    .select({ email: salesLeads.email })
    .from(salesLeads);
  const knownEmails = new Set(
    existing.flatMap((row) => (row.email ? [row.email.toLowerCase()] : [])),
  );
  let imported = 0;
  let skipped = 0;
  await db.transaction(async (tx) => {
    for (const row of rows) {
      const normalizedEmail = row.email.toLowerCase();
      if (normalizedEmail && knownEmails.has(normalizedEmail)) {
        skipped += 1;
        continue;
      }
      const id = createId();
      await tx.insert(salesLeads).values({
        id,
        companyName: row.companyName,
        contactName: row.contactName || null,
        email: row.email || null,
        phone: row.phone || null,
        website: row.website || null,
        street: row.street || null,
        postalCode: row.postalCode || null,
        city: row.city || null,
        country: row.country,
        source: "csv_import",
        status: "new",
        ownerUserId: actorUserId,
        nextTaskAt: row.nextTaskAt,
      });
      if (row.note)
        await tx.insert(salesActivities).values({
          id: createId(),
          leadId: id,
          actorUserId,
          activityType: "csv_import_note",
          note: row.note,
        });
      if (normalizedEmail) knownEmails.add(normalizedEmail);
      imported += 1;
    }
  });
  return { imported, skipped };
}
