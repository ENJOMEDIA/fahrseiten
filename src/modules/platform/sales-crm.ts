import "server-only";

import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { salesActivities, salesLeads } from "@/db/schema";
import { createId } from "@/lib/ids";
import { salesStages, type LeadStatus } from "./sales-stages";

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
  const [leads, activities] = await Promise.all([
    db
      .select()
      .from(salesLeads)
      .orderBy(asc(salesLeads.status), desc(salesLeads.updatedAt)),
    db.select().from(salesActivities).orderBy(desc(salesActivities.createdAt)),
  ]);
  const latestByLead = new Map<string, (typeof activities)[number]>();
  for (const activity of activities) {
    if (!latestByLead.has(activity.leadId))
      latestByLead.set(activity.leadId, activity);
  }
  return leads.map((lead) => ({
    ...lead,
    latestActivity: latestByLead.get(lead.id) ?? null,
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
