import "server-only";

import { createHash } from "node:crypto";

import { and, desc, eq } from "drizzle-orm";
import sharp from "sharp";
import { z } from "zod";

import { db } from "@/db/client";
import {
  auditLogs,
  contractDocuments,
  signatureEvents,
  signatureRequests,
} from "@/db/schema";
import { createId } from "@/lib/ids";
import { findTenantBilling } from "@/modules/billing/service";
import {
  findPlatformLogoId,
  findPublicMedia,
} from "@/modules/media/repository";
import { getMediaStorage } from "@/modules/media/runtime-storage";
import { findPlatformTenant } from "@/modules/platform/tenant-directory";
import { findPlatformLegalProfile } from "@/modules/legal/repository";

import { createContractPdf } from "./pdf";
import {
  getSignatureProvider,
  type SignatureLevel,
  type VerifiedSignatureEvent,
} from "./provider";
import {
  contractStatusForSignature,
  mayTransitionSignatureRequest,
} from "./status";

async function loadContractLogo() {
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

export async function buildCurrentContractPdf(tenantId: string) {
  z.string().uuid().parse(tenantId);
  const [tenant, billing, platform, brandLogoPng] = await Promise.all([
    findPlatformTenant(tenantId),
    findTenantBilling(tenantId),
    findPlatformLegalProfile(),
    loadContractLogo().catch(() => undefined),
  ]);
  if (!tenant || !billing.profile || !billing.subscription || !platform)
    throw new Error(
      "Für den Vertrag fehlen Anbieter-, Rechnungs- oder Paketdaten.",
    );
  const documentId = createId();
  const contractNumber = `V-${tenant.customerNumber}-${documentId.slice(0, 8).toUpperCase()}`;
  const bytes = await createContractPdf({
    brandLogoPng,
    contractNumber,
    customerNumber: tenant.customerNumber,
    provider: {
      companyName: platform.data.companyName,
      representativeName: platform.data.representativeName,
      street: platform.data.street,
      postalCode: platform.data.postalCode,
      city: platform.data.city,
      country: platform.data.country,
      email: platform.data.email,
    },
    customer: billing.profile,
    packageName: billing.subscription.planNameSnapshot,
    monthlyPriceCents: billing.subscription.monthlyPriceCentsSnapshot,
    setupPriceCents: billing.subscription.setupPriceCentsSnapshot,
    startsAt: billing.subscription.startsAt,
    minimumTermMonths: billing.subscription.minimumTermMonths,
    cancellationNoticeMonths:
      billing.subscription.cancellationNoticeMonthsSnapshot,
    renewsIndefinitely: billing.subscription.renewsIndefinitelySnapshot,
    billingIntervalMonths: billing.subscription.billingIntervalMonths,
    billingAmountCents: billing.subscription.billingAmountCentsSnapshot,
    discountBasisPoints: billing.subscription.discountBasisPointsSnapshot,
    nextInvoiceAt: billing.subscription.nextInvoiceAt,
  });
  return {
    documentId,
    contractNumber,
    customerNumber: tenant.customerNumber,
    tenantId,
    subscriptionId: billing.subscription.id,
    signerName: billing.profile.recipientName || billing.profile.companyName,
    signerEmail: billing.profile.email,
    bytes,
  };
}

export async function prepareContractDocument(input: {
  tenantId: string;
  actorUserId: string;
}) {
  const parsed = z
    .object({ tenantId: z.string().uuid(), actorUserId: z.string().uuid() })
    .parse(input);
  const contract = await buildCurrentContractPdf(parsed.tenantId);
  const sha256 = createHash("sha256").update(contract.bytes).digest("hex");
  const storageKey = `${parsed.tenantId}/contracts/${contract.documentId}.pdf`;
  const originalName = `fahrseiten-vertrag-${contract.customerNumber}-${contract.contractNumber}.pdf`;
  await getMediaStorage().write(storageKey, contract.bytes);
  try {
    await db.transaction(async (tx) => {
      await tx.insert(contractDocuments).values({
        id: contract.documentId,
        tenantId: parsed.tenantId,
        subscriptionId: contract.subscriptionId,
        contractNumber: contract.contractNumber,
        sha256,
        storageKey,
        originalName,
        byteSize: contract.bytes.length,
        createdByUserId: parsed.actorUserId,
      });
      await tx.insert(auditLogs).values({
        id: createId(),
        tenantId: parsed.tenantId,
        actorUserId: parsed.actorUserId,
        action: "contract.document.prepared",
        entityType: "contract_document",
        entityId: contract.documentId,
        metadata: { contractNumber: contract.contractNumber, sha256 },
      });
    });
  } catch (error) {
    await getMediaStorage()
      .delete(storageKey)
      .catch(() => undefined);
    throw error;
  }
  return { ...contract, sha256, storageKey, originalName };
}

export async function listTenantContractDocuments(tenantId: string) {
  z.string().uuid().parse(tenantId);
  const [documents, requests] = await Promise.all([
    db
      .select()
      .from(contractDocuments)
      .where(eq(contractDocuments.tenantId, tenantId))
      .orderBy(desc(contractDocuments.createdAt)),
    db
      .select()
      .from(signatureRequests)
      .where(eq(signatureRequests.tenantId, tenantId))
      .orderBy(desc(signatureRequests.createdAt)),
  ]);
  const latestRequest = new Map<string, (typeof requests)[number]>();
  for (const request of requests)
    if (!latestRequest.has(request.contractDocumentId))
      latestRequest.set(request.contractDocumentId, request);
  return documents.map((document) => ({
    ...document,
    signatureRequest: latestRequest.get(document.id) ?? null,
  }));
}

export async function findContractDocumentForDownload(documentId: string) {
  z.string().uuid().parse(documentId);
  const rows = await db
    .select()
    .from(contractDocuments)
    .where(eq(contractDocuments.id, documentId))
    .limit(1);
  return rows[0] ?? null;
}

function signatureLevel(): SignatureLevel {
  const value = process.env.SIGNATURE_LEVEL ?? "advanced";
  return z.enum(["simple", "advanced", "qualified"]).parse(value);
}

export async function sendContractForSignature(input: {
  tenantId: string;
  documentId: string;
  actorUserId: string;
}) {
  const parsed = z
    .object({
      tenantId: z.string().uuid(),
      documentId: z.string().uuid(),
      actorUserId: z.string().uuid(),
    })
    .parse(input);
  const [document, billing] = await Promise.all([
    findContractDocumentForDownload(parsed.documentId),
    findTenantBilling(parsed.tenantId),
  ]);
  if (!document || document.tenantId !== parsed.tenantId)
    throw new Error("Vertragsdokument wurde nicht gefunden.");
  if (document.status !== "prepared" && document.status !== "expired")
    throw new Error(
      "Dieser Vertrag kann in seinem aktuellen Status nicht versendet werden.",
    );
  if (!billing.profile)
    throw new Error("Für die Signatur fehlt eine Rechnungsanschrift.");

  const provider = getSignatureProvider();
  const requestId = createId();
  const appBaseUrl = z.url().parse(process.env.APP_BASE_URL);
  const signerName =
    billing.profile.recipientName || billing.profile.companyName;
  const signerEmail = billing.profile.email;
  const bytes = await getMediaStorage().read(document.storageKey);
  await db.insert(signatureRequests).values({
    id: requestId,
    tenantId: parsed.tenantId,
    contractDocumentId: document.id,
    provider: provider.key,
    signerName,
    signerEmail,
    createdByUserId: parsed.actorUserId,
  });
  try {
    const created = await provider.createRequest({
      requestId,
      contractNumber: document.contractNumber,
      documentSha256: document.sha256,
      document: bytes,
      signer: { name: signerName, email: signerEmail },
      returnUrl: `${appBaseUrl}/kunde/abrechnung`,
      webhookUrl: `${appBaseUrl}/api/signaturen/webhook/${provider.key}`,
      level: signatureLevel(),
    });
    const createdResult = z
      .object({
        externalId: z.string().trim().min(1).max(190),
        signingUrl: z.url().refine((value) => value.startsWith("https://"), {
          message: "Der Signatur-Link muss HTTPS verwenden.",
        }),
        expiresAt: z.date().nullable(),
      })
      .parse(created);
    await db.transaction(async (tx) => {
      await tx
        .update(signatureRequests)
        .set({
          externalId: createdResult.externalId,
          signingUrl: createdResult.signingUrl,
          expiresAt: createdResult.expiresAt,
          status: "pending",
          lastEventAt: new Date(),
        })
        .where(eq(signatureRequests.id, requestId));
      await tx
        .update(contractDocuments)
        .set({ status: "sent" })
        .where(eq(contractDocuments.id, document.id));
      await tx.insert(auditLogs).values({
        id: createId(),
        tenantId: parsed.tenantId,
        actorUserId: parsed.actorUserId,
        action: "contract.signature.sent",
        entityType: "signature_request",
        entityId: requestId,
        metadata: { provider: provider.key },
      });
    });
    return { requestId, ...createdResult };
  } catch (error) {
    await db
      .update(signatureRequests)
      .set({ status: "failed", errorCode: "provider_request_failed" })
      .where(eq(signatureRequests.id, requestId));
    throw error;
  }
}

export async function applyVerifiedSignatureEvent(
  provider: string,
  event: VerifiedSignatureEvent,
  payloadSha256: string,
) {
  const providerEventId = `${provider}:${event.providerEventId}`;
  const existingEvents = await db
    .select({ payloadSha256: signatureEvents.payloadSha256 })
    .from(signatureEvents)
    .where(eq(signatureEvents.providerEventId, providerEventId))
    .limit(1);
  if (existingEvents[0]) {
    if (existingEvents[0].payloadSha256 !== payloadSha256)
      throw new Error(
        "Die Anbieter-Ereignis-ID wurde mit anderem Inhalt wiederholt.",
      );
    return;
  }
  const rows = await db
    .select()
    .from(signatureRequests)
    .where(
      and(
        eq(signatureRequests.provider, provider),
        eq(signatureRequests.externalId, event.externalRequestId),
      ),
    )
    .limit(1);
  const request = rows[0];
  if (!request) throw new Error("Unbekannter Signaturvorgang.");
  if (!mayTransitionSignatureRequest(request.status, event.type))
    throw new Error("Ungültiger Signaturstatuswechsel.");

  const assertPdf = (bytes: Uint8Array, label: string) => {
    if (
      bytes.length < 5 ||
      bytes.length > 25 * 1024 * 1024 ||
      new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-"
    )
      throw new Error(`${label} ist keine gültige PDF-Datei.`);
  };
  if (event.type === "signed" && !event.signedDocument)
    throw new Error("Das signierte Vertragsdokument fehlt.");
  if (event.signedDocument)
    assertPdf(event.signedDocument, "Das signierte Vertragsdokument");
  if (event.evidenceDocument)
    assertPdf(event.evidenceDocument, "Das Prüfprotokoll");

  const signedStorageKey = event.signedDocument
    ? `${request.tenantId}/contracts/${request.contractDocumentId}-signed.pdf`
    : null;
  const evidenceStorageKey = event.evidenceDocument
    ? `${request.tenantId}/contracts/${request.contractDocumentId}-evidence.pdf`
    : null;
  if (signedStorageKey && event.signedDocument)
    await getMediaStorage().write(signedStorageKey, event.signedDocument);
  if (evidenceStorageKey && event.evidenceDocument)
    await getMediaStorage().write(evidenceStorageKey, event.evidenceDocument);

  await db.transaction(async (tx) => {
    await tx
      .insert(signatureEvents)
      .values({
        id: createId(),
        signatureRequestId: request.id,
        providerEventId,
        eventType: event.type,
        payloadSha256,
        occurredAt: event.occurredAt,
      })
      .onDuplicateKeyUpdate({ set: { payloadSha256 } });
    await tx
      .update(signatureRequests)
      .set({
        status: event.type,
        lastEventAt: event.occurredAt,
        errorCode: null,
      })
      .where(eq(signatureRequests.id, request.id));
    await tx
      .update(contractDocuments)
      .set({
        status: contractStatusForSignature(event.type),
        signedStorageKey: signedStorageKey ?? undefined,
        evidenceStorageKey: evidenceStorageKey ?? undefined,
        signedAt: event.type === "signed" ? event.occurredAt : undefined,
      })
      .where(eq(contractDocuments.id, request.contractDocumentId));
    await tx.insert(auditLogs).values({
      id: createId(),
      tenantId: request.tenantId,
      action: `contract.signature.${event.type}`,
      entityType: "signature_request",
      entityId: request.id,
      metadata: { provider, providerEventId: event.providerEventId },
    });
  });
}
