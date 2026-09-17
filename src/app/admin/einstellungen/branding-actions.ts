"use server";

import { revalidatePath } from "next/cache";

import {
  databaseMediaRepository,
  setPlatformFavicon,
  setPlatformLogo,
} from "@/modules/media/repository";
import { getMediaStorage } from "@/modules/media/runtime-storage";
import { uploadImage } from "@/modules/media/service";
import { requirePlatformPermission } from "@/modules/platform/access";

export async function uploadPlatformBrandAsset(formData: FormData) {
  await requirePlatformPermission("platform.security.manage");
  const file = formData.get("file");
  if (!(file instanceof File))
    throw new Error("Bitte eine Bilddatei auswählen.");
  const kind = formData.get("kind") === "favicon" ? "favicon" : "logo";
  const asset = await uploadImage({
    tenantId: null,
    bytes: new Uint8Array(await file.arrayBuffer()),
    metadata: {
      originalName: file.name,
      claimedMimeType: file.type,
      altText: kind === "logo" ? "FahrSeiten Logo" : "FahrSeiten Favicon",
      description:
        kind === "logo"
          ? "Zentrales Markenlogo der FahrSeiten-Plattform"
          : "Browser- und App-Symbol der FahrSeiten-Plattform",
    },
    storage: getMediaStorage(),
    repository: databaseMediaRepository,
  });
  if (kind === "favicon") await setPlatformFavicon(asset.id);
  else await setPlatformLogo(asset.id);
  revalidatePath("/admin/einstellungen");
  revalidatePath("/", "layout");
}
