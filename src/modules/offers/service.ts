import "server-only";

import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import {
  salesActivities,
  salesLeads,
  salesOffers,
  type SalesOfferItem,
} from "@/db/schema";
import { createId } from "@/lib/ids";
import { findPlatformLegalProfile } from "@/modules/legal/repository";
import {
  findPlatformLogoId,
  findPublicMedia,
} from "@/modules/media/repository";
import { getMediaStorage } from "@/modules/media/runtime-storage";
import { priceToCents } from "@/modules/platform/pricing";
import sharp from "sharp";

import { createSalesOfferPdf } from "./pdf";

const offerStatusSchema = z.enum([
  "draft",
  "sent",
  "accepted",
  "declined",
  "expired",
]);

export async function listSalesOffers(leadId: string) {
  return db
    .select()
    .from(salesOffers)
    .where(eq(salesOffers.leadId, z.uuid().parse(leadId)))
    .orderBy(desc(salesOffers.createdAt));
}

export async function createSalesOffer(input: {
  leadId: string;
  actorUserId: string;
  title: string;
  validUntil: string;
  introduction: string;
  descriptions: string[];
  quantities: string[];
  unitPrices: string[];
  vatRate: string;
  smallBusinessExempt: boolean;
}) {
  const parsed = z
    .object({
      leadId: z.uuid(),
      actorUserId: z.uuid(),
      title: z.string().trim().min(3).max(180),
      validUntil: z.coerce.date(),
      introduction: z.string().trim().max(2_000),
      vatRate: z.string().trim(),
    })
    .parse(input);
  if (parsed.validUntil <= new Date())
    throw new Error("Das Angebot muss mindestens bis morgen gültig sein.");
  const vatRate = Number(parsed.vatRate.replace(",", "."));
  if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100)
    throw new Error("Bitte einen gültigen Umsatzsteuersatz angeben.");
  const vatRateBasisPoints = input.smallBusinessExempt
    ? 0
    : Math.round(vatRate * 100);
  const items: SalesOfferItem[] = input.descriptions.flatMap(
    (description, index) => {
      const text = z.string().trim().max(300).parse(description);
      if (!text) return [];
      const quantity = z.coerce
        .number()
        .int()
        .min(1)
        .max(999)
        .parse(input.quantities[index] ?? "1");
      const unitPriceCents = priceToCents(input.unitPrices[index] ?? "");
      if (unitPriceCents === null)
        throw new Error(`Für „${text}“ fehlt der Preis.`);
      return [{ description: text, quantity, unitPriceCents }];
    },
  );
  if (!items.length)
    throw new Error("Bitte mindestens eine Angebotsposition angeben.");
  const [lead] = await db
    .select({ id: salesLeads.id })
    .from(salesLeads)
    .where(eq(salesLeads.id, parsed.leadId))
    .limit(1);
  if (!lead) throw new Error("Die Kundenakte wurde nicht gefunden.");
  const id = createId();
  const offerNumber = `AN-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${id.slice(0, 8).toUpperCase()}`;
  const netTotalCents = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceCents,
    0,
  );
  await db.transaction(async (tx) => {
    await tx.insert(salesOffers).values({
      id,
      leadId: parsed.leadId,
      offerNumber,
      title: parsed.title,
      validUntil: parsed.validUntil,
      introduction: parsed.introduction || null,
      items,
      netTotalCents,
      vatRateBasisPoints,
      smallBusinessExempt: input.smallBusinessExempt,
      createdByUserId: parsed.actorUserId,
    });
    await tx
      .update(salesLeads)
      .set({ status: "offer" })
      .where(eq(salesLeads.id, parsed.leadId));
    await tx.insert(salesActivities).values({
      id: createId(),
      leadId: parsed.leadId,
      actorUserId: parsed.actorUserId,
      activityType: "offer_created",
      note: `Angebot ${offerNumber} über ${(netTotalCents / 100).toFixed(2)} EUR netto erstellt.`,
    });
  });
  return id;
}

export async function updateSalesOfferStatus(input: {
  offerId: string;
  status: string;
  actorUserId: string;
}) {
  const offerId = z.uuid().parse(input.offerId);
  const status = offerStatusSchema.parse(input.status);
  const [offer] = await db
    .select()
    .from(salesOffers)
    .where(eq(salesOffers.id, offerId))
    .limit(1);
  if (!offer) throw new Error("Das Angebot wurde nicht gefunden.");
  await db.transaction(async (tx) => {
    await tx
      .update(salesOffers)
      .set({ status })
      .where(eq(salesOffers.id, offer.id));
    if (status === "accepted")
      await tx
        .update(salesLeads)
        .set({ status: "won" })
        .where(eq(salesLeads.id, offer.leadId));
    if (status === "declined")
      await tx
        .update(salesLeads)
        .set({ status: "lost" })
        .where(eq(salesLeads.id, offer.leadId));
    await tx.insert(salesActivities).values({
      id: createId(),
      leadId: offer.leadId,
      actorUserId: input.actorUserId,
      activityType: `offer_${status}`,
      note: `Angebot ${offer.offerNumber}: Status auf ${status} gesetzt.`,
    });
  });
}

export async function buildSalesOfferPdf(offerId: string) {
  const [offer] = await db
    .select()
    .from(salesOffers)
    .where(eq(salesOffers.id, z.uuid().parse(offerId)))
    .limit(1);
  if (!offer) return null;
  const [[lead], sender, brandLogoPng] = await Promise.all([
    db
      .select()
      .from(salesLeads)
      .where(eq(salesLeads.id, offer.leadId))
      .limit(1),
    findPlatformLegalProfile(),
    loadOfferLogo().catch(() => undefined),
  ]);
  if (!lead || !sender)
    throw new Error("Für das Angebot fehlen Kontakt- oder Anbieterangaben.");
  const bytes = await createSalesOfferPdf({
    ...offer,
    brandLogoPng,
    recipient: {
      companyName: lead.companyName,
      contactName: lead.contactName,
      street: lead.street,
      postalCode: lead.postalCode,
      city: lead.city,
      country: lead.country,
    },
    sender: {
      companyName: sender.data.companyName,
      representativeName: sender.data.representativeName,
      street: sender.data.street,
      postalCode: sender.data.postalCode,
      city: sender.data.city,
      email: sender.data.email,
    },
  });
  return { offer, bytes };
}

async function loadOfferLogo() {
  const logoId = await findPlatformLogoId();
  if (!logoId) return undefined;
  const asset = await findPublicMedia(logoId);
  if (!asset) return undefined;
  const source = await getMediaStorage().read(asset.storageKey);
  return new Uint8Array(
    await sharp(source)
      .resize({
        width: 620,
        height: 168,
        fit: "inside",
        withoutEnlargement: true,
      })
      .png()
      .toBuffer(),
  );
}
