"use server";

import { revalidatePath } from "next/cache";

import type { LegalActionState } from "@/app/kunde/rechtliches/actions";
import { savePlatformLegalDocument } from "@/modules/legal/repository";
import { requirePlatformPermission } from "@/modules/platform/access";

export async function savePlatformLegalAction(
  _state: LegalActionState,
  formData: FormData,
): Promise<LegalActionState> {
  const identity = await requirePlatformPermission("platform.security.manage");
  const type = formData.get("type");
  if (type !== "imprint" && type !== "privacy")
    return { message: "Unbekannter Dokumenttyp.", error: true };
  try {
    const publish = formData.get("intent") === "publish";
    await savePlatformLegalDocument(identity.id, {
      type,
      content: String(formData.get("content") ?? ""),
      publish,
    });
    revalidatePath("/admin/rechtliches");
    revalidatePath(type === "imprint" ? "/impressum" : "/datenschutz");
    return {
      message: publish
        ? "Geprüfte Fassung veröffentlicht."
        : "Entwurf gespeichert.",
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Speichern fehlgeschlagen.",
      error: true,
    };
  }
}
