"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import type { MaintenanceActionState } from "@/components/setup/maintenance-form";
import { hasTenantPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import { updateTenantMaintenance } from "@/modules/setup/maintenance";
import { createMembershipTenantContext } from "@/modules/tenancy/tenant-context";

export async function saveTenantMaintenance(
  _state: MaintenanceActionState,
  formData: FormData,
): Promise<MaintenanceActionState> {
  const identity = await getSessionIdentity();
  if (!identity) redirect("/login");
  const membership = identity.memberships[0];
  if (
    !membership ||
    !hasTenantPermission(membership.role, "tenant.settings.manage")
  ) {
    notFound();
  }
  const context = createMembershipTenantContext({
    requestedTenantId: membership.tenantId,
    userId: identity.id,
    activeTenantIds: identity.memberships.map((item) => item.tenantId),
  });
  try {
    await updateTenantMaintenance(context, {
      enabled: formData.get("enabled") === "on",
      message: String(formData.get("message") ?? ""),
    });
    revalidatePath("/kunde/einstellungen");
    revalidatePath("/site", "layout");
    return {
      message: "Wartungsmodus wurde gespeichert.",
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Wartungsmodus konnte nicht gespeichert werden.",
      error: true,
    };
  }
}
