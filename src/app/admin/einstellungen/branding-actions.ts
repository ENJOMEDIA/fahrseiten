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

export type BrandAssetActionState = { message: string; error: boolean };

export async function uploadPlatformBrandAsset(
  _state: BrandAssetActionState,
  formData: FormData,
): Promise<BrandAssetActionState> {
  await requirePlatformPermission("platform.security.manage");
  try {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0)
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
    return {
      message:
        kind === "favicon"
          ? "Favicon wurde gespeichert. Browser können das alte Symbol noch kurz zwischenspeichern."
          : "Seitenlogo wurde gespeichert.",
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Die Bilddatei konnte nicht gespeichert werden.",
      error: true,
    };
  }
}
