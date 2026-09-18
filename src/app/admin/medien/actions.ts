"use server";

import { revalidatePath } from "next/cache";
import {
  databaseMediaRepository,
  setPlatformMediaCategory,
} from "@/modules/media/repository";
import { queueMediaOptimization } from "@/modules/media/processing";
import { getMediaStorage } from "@/modules/media/runtime-storage";
import {
  parsePlatformMediaCategory,
  uploadImage,
} from "@/modules/media/service";
import { requirePlatformPermission } from "@/modules/platform/access";

export async function uploadPlatformMedia(formData: FormData) {
  await requirePlatformPermission("platform.security.manage");
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size)
    throw new Error("Bitte eine Bilddatei auswählen.");
  const asset = await uploadImage({
    tenantId: null,
    bytes: new Uint8Array(await file.arrayBuffer()),
    metadata: {
      originalName: file.name,
      claimedMimeType: file.type,
      altText: String(formData.get("altText") ?? ""),
      description: String(formData.get("description") ?? ""),
      category: parsePlatformMediaCategory(
        formData.get("category") ?? "general",
      ),
    },
    storage: getMediaStorage(),
    repository: databaseMediaRepository,
  });
  if (!["image/svg+xml", "image/x-icon"].includes(asset.mimeType))
    await queueMediaOptimization({
      tenantId: null,
      mediaId: asset.id,
      cropAspect: "original",
      cropX: 50,
      cropY: 50,
      cropZoom: 100,
    });
  revalidatePath("/admin/medien");
}

export async function categorizePlatformMedia(formData: FormData) {
  await requirePlatformPermission("platform.security.manage");
  await setPlatformMediaCategory(
    String(formData.get("mediaId") ?? ""),
    formData.get("category"),
  );
  revalidatePath("/admin/medien");
}

export async function cropPlatformMedia(formData: FormData) {
  await requirePlatformPermission("platform.security.manage");
  await queueMediaOptimization({
    tenantId: null,
    mediaId: String(formData.get("mediaId")),
    cropAspect: String(formData.get("cropAspect")) as "original",
    cropX: formData.get("cropX"),
    cropY: formData.get("cropY"),
    cropZoom: formData.get("cropZoom"),
  });
  revalidatePath("/admin/medien");
}
