"use server";

import { revalidatePath } from "next/cache";

import type { LegalActionState } from "@/app/kunde/rechtliches/actions";
import {
  createStructuredLegalDocuments,
  parseLegalProfileForm,
} from "@/modules/legal/documents";
import {
  savePlatformLegalDocument,
  savePlatformLegalProfile,
} from "@/modules/legal/repository";
import { requirePlatformPermission } from "@/modules/platform/access";

export async function savePlatformLegalAction(
  _state: LegalActionState,
  formData: FormData,
): Promise<LegalActionState> {
  const identity = await requirePlatformPermission("platform.security.manage");
  try {
    const publish = formData.get("intent") === "publish";
    const submittedProfile = parseLegalProfileForm(formData);
    const profile = {
      ...submittedProfile,
      modules: {
        ...submittedProfile.modules,
        contactForm: true,
        emailDelivery: true,
        consentManagement: true,
      },
    };
    const documents = createStructuredLegalDocuments(profile);
    await savePlatformLegalProfile(identity.id, profile);
    await savePlatformLegalDocument(identity.id, {
      type: "imprint",
      content: documents.imprint,
      publish,
    });
    await savePlatformLegalDocument(identity.id, {
      type: "privacy",
      content: documents.privacy,
      publish,
    });
    revalidatePath("/admin/rechtliches");
    revalidatePath("/impressum");
    revalidatePath("/datenschutz");
    return {
      message: publish
        ? "Impressum und Datenschutz wurden als geprüfte Fassungen veröffentlicht."
        : "Strukturierte Angaben und beide Entwürfe wurden aktualisiert.",
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
