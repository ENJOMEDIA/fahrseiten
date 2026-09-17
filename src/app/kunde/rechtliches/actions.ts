"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { hasTenantPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import { saveTenantLegalDocument } from "@/modules/legal/repository";
import { createMembershipTenantContext } from "@/modules/tenancy/tenant-context";

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
  const type = formData.get("type");
  if (type !== "imprint" && type !== "privacy")
    return { message: "Unbekannter Dokumenttyp.", error: true };
  const context = createMembershipTenantContext({
    requestedTenantId: membership.tenantId,
    userId: identity.id,
    activeTenantIds: identity.memberships.map((item) => item.tenantId),
  });
  try {
    const publish = formData.get("intent") === "publish";
    await saveTenantLegalDocument(context, {
      type,
      content: String(formData.get("content") ?? ""),
      publish,
    });
    revalidatePath("/kunde/rechtliches");
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
