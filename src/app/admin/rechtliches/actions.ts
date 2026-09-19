"use server";

import { revalidatePath } from "next/cache";

import type { LegalActionState } from "@/app/kunde/rechtliches/actions";
import {
  createPlatformTerms,
  createStructuredLegalDocuments,
  parseLegalProfileForm,
} from "@/modules/legal/documents";
import {
  findPlatformLegalProfile,
  savePlatformLegalDocument,
  savePlatformLegalProfile,
} from "@/modules/legal/repository";
import { requirePlatformPermission } from "@/modules/platform/access";

export async function replacePlatformTermsTemplateAction() {
  const identity = await requirePlatformPermission("platform.security.manage");
  const profile = await findPlatformLegalProfile();
  if (!profile) throw new Error("Plattformstammdaten fehlen.");
  await savePlatformLegalDocument(identity.id, {
    type: "terms",
    content: createPlatformTerms(profile.data),
    publish: false,
  });
  revalidatePath("/admin/rechtliches");
}

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
        analytics: true,
      },
    };
    const documents = createStructuredLegalDocuments({
      ...profile,
      platformPostalAcquisition: true,
    });
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

export async function savePlatformTermsAction(
  _state: LegalActionState,
  formData: FormData,
): Promise<LegalActionState> {
  const identity = await requirePlatformPermission("platform.security.manage");
  try {
    const content = String(formData.get("content") ?? "");
    const publish = formData.get("intent") === "publish";
    await savePlatformLegalDocument(identity.id, {
      type: "terms",
      content,
      publish,
    });
    revalidatePath("/admin/rechtliches");
    revalidatePath("/agb");
    return {
      message: publish
        ? "Die AGB wurden als geprüfte Fassung veröffentlicht."
        : "Der AGB-Entwurf wurde gespeichert.",
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "AGB konnten nicht gespeichert werden.",
      error: true,
    };
  }
}
