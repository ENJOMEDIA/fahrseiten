"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { hasTenantPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import {
  createTenantContentEntry,
  setTenantContentEntryActive,
  type ContentModuleKey,
} from "@/modules/content/management";
import { contentModules } from "@/modules/customer/navigation";

export type ContentActionState = { message: string; error: boolean };

async function writableMembership() {
  const identity = await getSessionIdentity();
  if (!identity) redirect("/login");
  const membership = identity.memberships[0];
  if (
    !membership ||
    !hasTenantPermission(membership.role, "tenant.content.write")
  )
    notFound();
  return membership;
}

function checkedModule(value: FormDataEntryValue | null) {
  const contentModule = String(value) as ContentModuleKey;
  if (!(contentModule in contentModules))
    throw new Error("Inhaltsbereich ist ungültig.");
  return contentModule;
}

export async function createContentEntryAction(
  _state: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const membership = await writableMembership();
  try {
    const contentModule = checkedModule(formData.get("module"));
    await createTenantContentEntry({
      tenantId: membership.tenantId,
      module: contentModule,
      formData,
    });
    revalidatePath(`/kunde/inhalte/${contentModule}`);
    return { message: "Eintrag wurde gespeichert.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Eintrag konnte nicht gespeichert werden.",
      error: true,
    };
  }
}

export async function toggleContentEntryAction(
  _state: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const membership = await writableMembership();
  try {
    const contentModule = checkedModule(formData.get("module"));
    await setTenantContentEntryActive({
      tenantId: membership.tenantId,
      module: contentModule,
      id: String(formData.get("id")),
      active: formData.get("active") === "true",
    });
    revalidatePath(`/kunde/inhalte/${contentModule}`);
    return { message: "Sichtbarkeit wurde geändert.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Änderung konnte nicht gespeichert werden.",
      error: true,
    };
  }
}
