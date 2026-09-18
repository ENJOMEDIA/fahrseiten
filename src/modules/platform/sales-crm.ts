import "server-only";

import { asc, desc, eq, like } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { backgroundJobs, salesActivities, salesLeads } from "@/db/schema";
import { createId } from "@/lib/ids";
import { salesStages, type LeadStatus } from "./sales-stages";
import type { SalesCsvRow } from "./sales-csv";

const createLeadSchema = z.object({
  companyName: z.string().trim().min(2).max(180),
  contactName: z.string().trim().max(160),
  email: z.union([z.literal(""), z.email()]),
  phone: z.string().trim().max(40),
  website: z.union([z.literal(""), z.url()]),
  note: z.string().trim().max(3_000),
  nextTaskAt: z.string().trim(),
});

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

export async function createManualLead(raw: unknown, actorUserId: string) {
  const input = createLeadSchema.parse(raw);
  const id = createId();
  await db.transaction(async (tx) => {
    await tx.insert(salesLeads).values({
      id,
      companyName: input.companyName,
      contactName: input.contactName || null,
      email: input.email || null,
      phone: input.phone || null,
      website: input.website || null,
      source: "manual",
      status: "new",
      ownerUserId: actorUserId,
      nextTaskAt: parseTaskDate(input.nextTaskAt),
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
}) {
  const status = z.enum(salesStages).parse(input.status);
  const note = z.string().trim().max(3_000).parse(input.note);
  await db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: salesLeads.id })
      .from(salesLeads)
      .where(eq(salesLeads.id, input.id))
      .limit(1);
    if (!existing[0]) throw new Error("Interessent wurde nicht gefunden.");
    await tx
      .update(salesLeads)
      .set({ status, nextTaskAt: parseTaskDate(input.nextTaskAt) })
      .where(eq(salesLeads.id, input.id));
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
  return db.transaction(async (tx) => {
    const [lead] = await tx
      .select({ companyName: salesLeads.companyName })
      .from(salesLeads)
      .where(eq(salesLeads.id, id))
      .limit(1);
    if (!lead) throw new Error("Der Akquise-Kontakt wurde nicht gefunden.");
    if (input.confirmation.trim() !== lead.companyName)
      throw new Error("Der eingegebene Name stimmt nicht überein.");

    // Versandjobs enthalten keinen Fremdschlüssel zum Lead. Sie werden deshalb
    // vor dem Kontakt entfernt; Zustellnachweise hängen daran und folgen per CASCADE.
    await tx
      .delete(backgroundJobs)
      .where(like(backgroundJobs.idempotencyKey, `sales:${id}:%`));
    await tx.delete(salesLeads).where(eq(salesLeads.id, id));
    return { companyName: lead.companyName };
  });
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
