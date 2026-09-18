import { randomUUID } from "node:crypto";

import { z } from "zod";

import { inspectImage } from "./image-inspection";
import type { MediaStorage } from "./storage";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const mediaCategoryValues = [
  "general",
  "branding",
  "vehicles",
  "locations",
  "team",
  "courses",
  "content",
] as const;
export type MediaCategory = (typeof mediaCategoryValues)[number];
export const mediaCategoryLabels: Record<MediaCategory, string> = {
  general: "Allgemein",
  branding: "Logo & Marke",
  vehicles: "Fahrzeuge",
  locations: "Standorte & Räume",
  team: "Team",
  courses: "Kurse & Ausbildung",
  content: "Website-Inhalte",
};
const metadataSchema = z.object({
  originalName: z.string().trim().min(1).max(255),
  claimedMimeType: z.string().max(100),
  altText: z.string().trim().max(300),
  description: z.string().trim().max(2_000).optional(),
  category: z.enum(mediaCategoryValues).default("general"),
});
export type MediaAssetRecord = z.infer<typeof metadataSchema> & {
  id: string;
  tenantId: string | null;
  storageKey: string;
  mimeType: string;
  byteSize: number;
  width: number;
  height: number;
  archivedAt?: Date;
  optimizedStorageKey?: string;
  optimizedByteSize?: number;
  cropAspect?: "original" | "16:9" | "4:3" | "1:1";
  cropX?: number;
  cropY?: number;
  cropZoom?: number;
  processingStatus?: "original" | "queued" | "processing" | "ready" | "failed";
};

export interface MediaRepository {
  create(asset: MediaAssetRecord): Promise<void>;
  find(tenantId: string, id: string): Promise<MediaAssetRecord | null>;
  usageCount(tenantId: string, id: string): Promise<number>;
  archive(tenantId: string, id: string): Promise<void>;
}

export async function uploadImage(input: {
  tenantId: string | null;
  bytes: Uint8Array;
  metadata: unknown;
  storage: MediaStorage;
  repository: MediaRepository;
}): Promise<MediaAssetRecord> {
  if (input.bytes.length === 0 || input.bytes.length > MAX_IMAGE_BYTES)
    throw new Error("Das Bild darf höchstens 8 MB groß sein.");
  const metadata = metadataSchema.parse(input.metadata);
  const inspected = inspectImage(input.bytes);
  const acceptedClaims: Record<string, string[]> = {
    "image/x-icon": [
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "image/ico",
      "image/icon",
    ],
  };
  const allowedClaims = acceptedClaims[inspected.mimeType] ?? [
    inspected.mimeType,
  ];
  if (
    metadata.claimedMimeType &&
    metadata.claimedMimeType !== "application/octet-stream" &&
    !allowedClaims.includes(metadata.claimedMimeType)
  )
    throw new Error("Dateityp und Bildinhalt stimmen nicht überein.");
  if (
    inspected.width < 1 ||
    inspected.height < 1 ||
    inspected.width > 12_000 ||
    inspected.height > 12_000
  )
    throw new Error("Ungültige Bildabmessungen.");
  const id = randomUUID();
  const storageKey = `${input.tenantId ?? "platform"}/${id}.${inspected.extension}`;
  const asset: MediaAssetRecord = {
    ...metadata,
    id,
    tenantId: input.tenantId,
    storageKey,
    mimeType: inspected.mimeType,
    byteSize: input.bytes.length,
    width: inspected.width,
    height: inspected.height,
  };
  await input.storage.write(storageKey, input.bytes);
  await input.repository.create(asset);
  return asset;
}

export async function selectTenantImage(
  tenantId: string,
  mediaId: string,
  repository: MediaRepository,
) {
  const asset = await repository.find(tenantId, mediaId);
  if (!asset || asset.archivedAt) throw new Error("Medium nicht gefunden.");
  return asset;
}

export async function assignImageToBlock(
  tenantId: string,
  mediaId: string,
  repository: MediaRepository,
) {
  const asset = await selectTenantImage(tenantId, mediaId, repository);
  return { mediaId: asset.id, imageAlt: asset.altText };
}

export async function archiveImage(
  tenantId: string,
  mediaId: string,
  repository: MediaRepository,
  confirmUsed = false,
) {
  const asset = await selectTenantImage(tenantId, mediaId, repository);
  const usages = await repository.usageCount(tenantId, asset.id);
  if (usages > 0 && !confirmUsed)
    throw new Error(`Das Bild wird noch ${usages}-mal verwendet.`);
  await repository.archive(tenantId, mediaId);
}
