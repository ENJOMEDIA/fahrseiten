"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { hasTenantPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import {
  createStructuredLegalDocuments,
  parseLegalProfileForm,
} from "@/modules/legal/documents";
import {
  enforceRequiredTenantLegalModules,
  saveTenantLegalDocument,
  saveTenantLegalProfile,
} from "@/modules/legal/repository";
import { createMembershipTenantContext } from "@/modules/tenancy/tenant-context";
import { assertTenantFeature } from "@/modules/features/access";

export type LegalActionState = { message: string; error: boolean };

export async function saveLegalAction(
  _state: LegalActionState,
  formData: FormData,
): Promise<LegalActionState> {
  const identity = await getSessionIdentity();
  if (!identity) redirect("/login");
  const membership = identity.memberships[0];
  if (
    !membership ||
    !hasTenantPermission(membership.role, "tenant.settings.manage")
  )
    notFound();
  const context = createMembershipTenantContext({
    requestedTenantId: membership.tenantId,
    userId: identity.id,
    activeTenantIds: identity.memberships.map((item) => item.tenantId),
  });
  try {
    await assertTenantFeature(context.tenantId, "legal_consent");
    const publish = formData.get("intent") === "publish";
    const submittedProfile = parseLegalProfileForm(formData);
    const profile = {
      ...submittedProfile,
      modules: await enforceRequiredTenantLegalModules(
        context.tenantId,
        submittedProfile.modules,
      ),
    };
    const documents = createStructuredLegalDocuments(profile);
    await saveTenantLegalProfile(context, profile);
    await saveTenantLegalDocument(context, {
      type: "imprint",
      content: documents.imprint,
      publish,
    });
    await saveTenantLegalDocument(context, {
      type: "privacy",
      content: documents.privacy,
      publish,
    });
    revalidatePath("/kunde/rechtliches");
    revalidatePath("/site", "layout");
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
