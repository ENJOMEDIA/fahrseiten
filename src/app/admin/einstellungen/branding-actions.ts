"use server";

import { revalidatePath } from "next/cache";

import {
  databaseMediaRepository,
  setPlatformLogo,
} from "@/modules/media/repository";
import { getMediaStorage } from "@/modules/media/runtime-storage";
import { uploadImage } from "@/modules/media/service";
import { requirePlatformPermission } from "@/modules/platform/access";

export async function uploadPlatformLogo(formData: FormData) {
  await requirePlatformPermission("platform.security.manage");
  const file = formData.get("file");
  if (!(file instanceof File))
    throw new Error("Bitte eine Bilddatei auswählen.");
  const asset = await uploadImage({
    tenantId: null,
    bytes: new Uint8Array(await file.arrayBuffer()),
    metadata: {
      originalName: file.name,
      claimedMimeType: file.type,
      altText: "FahrSeiten Logo",
      description: "Zentrales Markenlogo der FahrSeiten-Plattform",
    },
    storage: getMediaStorage(),
    repository: databaseMediaRepository,
  });
  await setPlatformLogo(asset.id);
  revalidatePath("/admin/einstellungen");
  revalidatePath("/", "layout");
}
