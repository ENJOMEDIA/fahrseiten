import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import {
  auditLogs,
  billingProfiles,
  invoiceRecords,
  subscriptions,
  tenants,
  type invoiceStatusValues,
} from "@/db/schema";
import { createId } from "@/lib/ids";
import { getMediaStorage } from "@/modules/media/runtime-storage";
import { priceToCents } from "@/modules/platform/pricing";

const MAX_INVOICE_BYTES = 10 * 1024 * 1024;
type InvoiceStatus = (typeof invoiceStatusValues)[number];

const billingProfileSchema = z.object({
  tenantId: z.string().uuid(),
  useLocationAddress: z.boolean(),
  companyName: z.string().trim().min(2).max(180),
  recipientName: z.string().trim().max(160).optional(),
  email: z.email(),
  street: z.string().trim().min(3).max(180),
  postalCode: z.string().trim().min(3).max(20),
  city: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(120),
  vatId: z.string().trim().max(40).optional(),
});

export async function findTenantBilling(tenantId: string) {
  const [profile, activeSubscription, invoices] = await Promise.all([
    db
      .select()
      .from(billingProfiles)
      .where(eq(billingProfiles.tenantId, tenantId))
      .limit(1),
    db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.status, "active"),
        ),
      )
      .limit(1),
    db
      .select()
      .from(invoiceRecords)
      .where(eq(invoiceRecords.tenantId, tenantId))
      .orderBy(desc(invoiceRecords.issuedAt)),
  ]);
  return {
    profile: profile[0] ?? null,
    subscription: activeSubscription[0] ?? null,
    invoices,
  };
}

export async function saveBillingProfile(
  raw: z.input<typeof billingProfileSchema>,
  actorUserId: string,
) {
  const input = billingProfileSchema.parse(raw);
  await db.transaction(async (tx) => {
    await tx
      .insert(billingProfiles)
      .values(input)
      .onDuplicateKeyUpdate({
        set: {
          useLocationAddress: input.useLocationAddress,
          companyName: input.companyName,
          recipientName: input.recipientName || null,
          email: input.email,
          street: input.street,
          postalCode: input.postalCode,
          city: input.city,
          country: input.country,
          vatId: input.vatId || null,
          updatedAt: new Date(),
        },
      });
    await tx.insert(auditLogs).values({
      id: createId(),
      tenantId: input.tenantId,
      actorUserId,
      action: "billing.profile.updated",
      entityType: "billing_profile",
      entityId: input.tenantId,
    });
  });
}

export async function updateSubscriptionSchedule(input: {
  tenantId: string;
  subscriptionId: string;
  minimumTermMonths: number;
  billingIntervalMonths: number;
  nextInvoiceAt: Date | null;
  actorUserId: string;
}) {
  const parsed = z
    .object({
      tenantId: z.string().uuid(),
      subscriptionId: z.string().uuid(),
      minimumTermMonths: z.number().int().min(1).max(120),
      billingIntervalMonths: z.number().int().min(1).max(24),
      nextInvoiceAt: z.date().nullable(),
      actorUserId: z.string().uuid(),
    })
    .parse(input);
  await db.transaction(async (tx) => {
    const result = await tx
      .update(subscriptions)
      .set({
        minimumTermMonths: parsed.minimumTermMonths,
        billingIntervalMonths: parsed.billingIntervalMonths,
        nextInvoiceAt: parsed.nextInvoiceAt,
      })
      .where(
        and(
          eq(subscriptions.id, parsed.subscriptionId),
          eq(subscriptions.tenantId, parsed.tenantId),
          eq(subscriptions.status, "active"),
        ),
      );
    if (result[0].affectedRows !== 1)
      throw new Error("Aktive Vertragszuordnung wurde nicht gefunden.");
    await tx.insert(auditLogs).values({
      id: createId(),
      tenantId: parsed.tenantId,
      actorUserId: parsed.actorUserId,
      action: "billing.schedule.updated",
      entityType: "subscription",
      entityId: parsed.subscriptionId,
      metadata: {
        minimumTermMonths: parsed.minimumTermMonths,
        billingIntervalMonths: parsed.billingIntervalMonths,
        nextInvoiceAt: parsed.nextInvoiceAt?.toISOString() ?? null,
      },
    });
  });
}

export async function uploadInvoiceCopy(input: {
  tenantId: string;
  invoiceNumber: string;
  externalReference?: string;
  issuedAt: Date;
  dueAt: Date;
  grossAmount: string;
  file: File;
  actorUserId: string;
}) {
  const metadata = z
    .object({
      tenantId: z.string().uuid(),
      invoiceNumber: z.string().trim().min(1).max(80),
      externalReference: z.string().trim().max(160).optional(),
      issuedAt: z.date(),
      dueAt: z.date(),
      grossAmount: z.string().trim().min(1).max(30),
      actorUserId: z.string().uuid(),
    })
    .parse(input);
  if (metadata.dueAt < metadata.issuedAt)
    throw new Error("Das Fälligkeitsdatum liegt vor dem Rechnungsdatum.");
  if (
    input.file.size < 5 ||
    input.file.size > MAX_INVOICE_BYTES ||
    input.file.type !== "application/pdf"
  )
    throw new Error(
      "Die Rechnung muss eine PDF-Datei mit höchstens 10 MB sein.",
    );
  const bytes = new Uint8Array(await input.file.arrayBuffer());
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-")
    throw new Error("Die hochgeladene Datei ist keine gültige PDF-Datei.");

  const [tenant, subscription] = await Promise.all([
    db
      .select({ customerNumber: tenants.customerNumber })
      .from(tenants)
      .where(eq(tenants.id, metadata.tenantId))
      .limit(1),
    db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.tenantId, metadata.tenantId),
          eq(subscriptions.status, "active"),
        ),
      )
      .limit(1),
  ]);
  if (!tenant[0]) throw new Error("Mandant wurde nicht gefunden.");
  const id = createId();
  const storageKey = `${metadata.tenantId}/billing/${id}.pdf`;
  const grossAmountCents = priceToCents(metadata.grossAmount);
  if (grossAmountCents === null)
    throw new Error("Der Bruttobetrag ist ungültig.");
  await getMediaStorage().write(storageKey, bytes);
  try {
    await db.transaction(async (tx) => {
      await tx.insert(invoiceRecords).values({
        id,
        tenantId: metadata.tenantId,
        subscriptionId: subscription[0]?.id ?? null,
        customerNumberSnapshot: tenant[0].customerNumber,
        invoiceNumber: metadata.invoiceNumber,
        externalProvider: "accountable",
        externalReference: metadata.externalReference || null,
        issuedAt: metadata.issuedAt,
        dueAt: metadata.dueAt,
        grossAmountCents,
        storageKey,
        originalName: input.file.name.slice(0, 255),
        byteSize: bytes.length,
        createdByUserId: metadata.actorUserId,
      });
      await tx.insert(auditLogs).values({
        id: createId(),
        tenantId: metadata.tenantId,
        actorUserId: metadata.actorUserId,
        action: "billing.invoice.uploaded",
        entityType: "invoice",
        entityId: id,
        metadata: { invoiceNumber: metadata.invoiceNumber },
      });
    });
  } catch (error) {
    await getMediaStorage()
      .delete(storageKey)
      .catch(() => undefined);
    throw error;
  }
  return id;
}

export async function updateInvoiceStatus(input: {
  tenantId: string;
  invoiceId: string;
  status: InvoiceStatus;
  actorUserId: string;
}) {
  const status = z
    .enum(["open", "paid", "overdue", "cancelled"])
    .parse(input.status);
  const result = await db
    .update(invoiceRecords)
    .set({ status, paidAt: status === "paid" ? new Date() : null })
    .where(
      and(
        eq(invoiceRecords.id, input.invoiceId),
        eq(invoiceRecords.tenantId, input.tenantId),
      ),
    );
  if (result[0].affectedRows !== 1)
    throw new Error("Rechnung wurde nicht gefunden.");
  await db.insert(auditLogs).values({
    id: createId(),
    tenantId: input.tenantId,
    actorUserId: input.actorUserId,
    action: "billing.invoice.status_updated",
    entityType: "invoice",
    entityId: input.invoiceId,
    metadata: { status },
  });
}

export async function findInvoiceForDownload(invoiceId: string) {
  const rows = await db
    .select()
    .from(invoiceRecords)
    .where(eq(invoiceRecords.id, invoiceId))
    .limit(1);
  return rows[0] ?? null;
}
