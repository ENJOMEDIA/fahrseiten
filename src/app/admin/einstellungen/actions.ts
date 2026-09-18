"use server";

import { revalidatePath } from "next/cache";

import type { MaintenanceActionState } from "@/components/setup/maintenance-form";
import { requirePlatformPermission } from "@/modules/platform/access";
import { updatePlatformMaintenance } from "@/modules/setup/maintenance";

export async function savePlatformMaintenance(
  _state: MaintenanceActionState,
  formData: FormData,
): Promise<MaintenanceActionState> {
  const identity = await requirePlatformPermission("platform.security.manage");
  try {
    await updatePlatformMaintenance({
      actorUserId: identity.id,
      enabled: formData.get("enabled") === "on",
      message: String(formData.get("message") ?? ""),
      demoAvailableDuringMaintenance:
        formData.get("demoAvailableDuringMaintenance") === "on",
    });
    revalidatePath("/", "layout");
    revalidatePath("/admin/einstellungen");
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
