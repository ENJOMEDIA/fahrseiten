import "server-only";

import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db/client";
import {
  mediaAssets,
  mediaUsages,
  platformSettings,
  themeSettings,
} from "@/db/schema";
import type { MediaAssetRecord, MediaRepository } from "./service";

function mapAsset(row: typeof mediaAssets.$inferSelect): MediaAssetRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    storageKey: row.storageKey,
    originalName: row.originalName,
    claimedMimeType: row.mimeType,
    mimeType: row.mimeType,
    byteSize: row.byteSize,
    width: row.width,
    height: row.height,
    altText: row.altText,
    description: row.description ?? undefined,
    archivedAt: row.archivedAt ?? undefined,
  };
}

export const databaseMediaRepository: MediaRepository = {
  async create(asset) {
    await db.insert(mediaAssets).values({
      id: asset.id,
      tenantId: asset.tenantId,
      storageKey: asset.storageKey,
      originalName: asset.originalName,
      mimeType: asset.mimeType,
      byteSize: asset.byteSize,
      width: asset.width,
      height: asset.height,
      altText: asset.altText,
      description: asset.description ?? null,
    });
  },
  async find(tenantId, id) {
    const [row] = await db
      .select()
      .from(mediaAssets)
      .where(and(eq(mediaAssets.tenantId, tenantId), eq(mediaAssets.id, id)))
      .limit(1);
    return row ? mapAsset(row) : null;
  },
  async usageCount(tenantId, id) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(mediaUsages)
      .where(
        and(eq(mediaUsages.tenantId, tenantId), eq(mediaUsages.mediaId, id)),
      );
    return Number(row?.count ?? 0);
  },
  async archive(tenantId, id) {
    await db
      .update(mediaAssets)
      .set({ archivedAt: new Date() })
      .where(and(eq(mediaAssets.tenantId, tenantId), eq(mediaAssets.id, id)));
  },
};

export async function listTenantMedia(tenantId: string) {
  const rows = await db
    .select()
    .from(mediaAssets)
    .where(
      and(eq(mediaAssets.tenantId, tenantId), isNull(mediaAssets.archivedAt)),
    )
    .orderBy(desc(mediaAssets.createdAt));
  return rows.map(mapAsset);
}

export async function findPublicMedia(id: string) {
  const [row] = await db
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.id, id), isNull(mediaAssets.archivedAt)))
    .limit(1);
  return row ? mapAsset(row) : null;
}

export async function setTenantLogo(tenantId: string, mediaId: string) {
  const asset = await databaseMediaRepository.find(tenantId, mediaId);
  if (!asset || asset.archivedAt)
    throw new Error("Das Logo gehört nicht zu diesem Mandanten.");
  await db
    .update(themeSettings)
    .set({ logoMediaId: mediaId })
    .where(eq(themeSettings.tenantId, tenantId));
}

export async function findTenantLogoId(tenantId: string) {
  const [row] = await db
    .select({ logoMediaId: themeSettings.logoMediaId })
    .from(themeSettings)
    .where(eq(themeSettings.tenantId, tenantId))
    .limit(1);
  return row?.logoMediaId ?? null;
}

export async function setPlatformLogo(mediaId: string) {
  const [asset] = await db
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(
      and(
        eq(mediaAssets.id, mediaId),
        isNull(mediaAssets.tenantId),
        isNull(mediaAssets.archivedAt),
      ),
    )
    .limit(1);
  if (!asset) throw new Error("Das Logo gehört nicht zur Plattform.");
  await db.update(platformSettings).set({ logoMediaId: mediaId });
}

export async function findPlatformLogoId() {
  const [row] = await db
    .select({ logoMediaId: platformSettings.logoMediaId })
    .from(platformSettings)
    .limit(1);
  return row?.logoMediaId ?? null;
}
