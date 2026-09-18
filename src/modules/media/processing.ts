import "server-only";

import { createHash } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import sharp from "sharp";
import { z } from "zod";

import { db } from "@/db/client";
import { backgroundJobs, mediaAssets } from "@/db/schema";
import { createId } from "@/lib/ids";
import type { JobRecord } from "@/modules/jobs/runner";
import { getMediaStorage } from "./runtime-storage";

const cropSchema = z.object({
  mediaId: z.uuid(),
  cropAspect: z.enum(["original", "16:9", "4:3", "1:1"]),
  cropX: z.coerce.number().int().min(0).max(100),
  cropY: z.coerce.number().int().min(0).max(100),
  cropZoom: z.coerce.number().int().min(100).max(200),
});

export async function queueMediaOptimization(
  input: z.input<typeof cropSchema> & { tenantId: string | null },
) {
  const crop = cropSchema.parse(input);
  const tenantCondition = input.tenantId
    ? eq(mediaAssets.tenantId, input.tenantId)
    : isNull(mediaAssets.tenantId);
  const [asset] = await db
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.id, crop.mediaId), tenantCondition))
    .limit(1);
  if (!asset) throw new Error("Medium wurde nicht gefunden.");
  if (["image/svg+xml", "image/x-icon"].includes(asset.mimeType))
    throw new Error(
      "SVG und ICO werden ohne Raster-Konvertierung bereitgestellt.",
    );
  const jobId = createId();
  await db.transaction(async (tx) => {
    await tx
      .update(mediaAssets)
      .set({ ...crop, processingStatus: "queued" })
      .where(eq(mediaAssets.id, asset.id));
    await tx.insert(backgroundJobs).values({
      id: jobId,
      tenantId: input.tenantId,
      type: "media_optimize",
      idempotencyKey: `media:${asset.id}:${jobId}`,
      payload: { mediaId: asset.id },
    });
  });
}

export async function processMediaJob(job: JobRecord) {
  const payload = z.object({ mediaId: z.uuid() }).parse(job.payload);
  const [asset] = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, payload.mediaId))
    .limit(1);
  if (!asset) throw new Error("MediaAssetMissing");
  await db
    .update(mediaAssets)
    .set({ processingStatus: "processing" })
    .where(eq(mediaAssets.id, asset.id));
  try {
    const input = await getMediaStorage().read(asset.storageKey);
    const ratios = { "16:9": 16 / 9, "4:3": 4 / 3, "1:1": 1 } as const;
    let pipeline = sharp(input, { failOn: "warning" }).rotate();
    const metadata = await pipeline.metadata();
    const width = metadata.width ?? asset.width;
    const height = metadata.height ?? asset.height;
    if (asset.cropAspect !== "original") {
      const ratio = ratios[asset.cropAspect];
      let cropWidth = width;
      let cropHeight = Math.round(cropWidth / ratio);
      if (cropHeight > height) {
        cropHeight = height;
        cropWidth = Math.round(cropHeight * ratio);
      }
      cropWidth = Math.max(1, Math.round((cropWidth * 100) / asset.cropZoom));
      cropHeight = Math.max(1, Math.round((cropHeight * 100) / asset.cropZoom));
      const left = Math.max(
        0,
        Math.min(
          width - cropWidth,
          Math.round(((width - cropWidth) * asset.cropX) / 100),
        ),
      );
      const top = Math.max(
        0,
        Math.min(
          height - cropHeight,
          Math.round(((height - cropHeight) * asset.cropY) / 100),
        ),
      );
      pipeline = pipeline.extract({
        left,
        top,
        width: cropWidth,
        height: cropHeight,
      });
    }
    const output = await pipeline
      .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 5 })
      .toBuffer();
    const key = `${asset.tenantId ?? "platform"}/optimized/${asset.id}-${createHash("sha256").update(output).digest("hex").slice(0, 12)}.webp`;
    await getMediaStorage().write(key, output);
    await db
      .update(mediaAssets)
      .set({
        optimizedStorageKey: key,
        optimizedByteSize: output.length,
        processingStatus: "ready",
      })
      .where(eq(mediaAssets.id, asset.id));
    if (asset.optimizedStorageKey && asset.optimizedStorageKey !== key)
      await getMediaStorage()
        .delete(asset.optimizedStorageKey)
        .catch(() => undefined);
  } catch (error) {
    await db
      .update(mediaAssets)
      .set({ processingStatus: "failed" })
      .where(eq(mediaAssets.id, asset.id));
    throw error;
  }
}
