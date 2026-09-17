"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformPermission } from "@/modules/platform/access";
import { updatePlatformMaintenance } from "@/modules/setup/maintenance";

export async function savePlatformMaintenance(formData: FormData) {
  const identity = await requirePlatformPermission("platform.security.manage");
  await updatePlatformMaintenance({
    actorUserId: identity.id,
    enabled: formData.get("enabled") === "on",
    message: String(formData.get("message") ?? ""),
  });
  revalidatePath("/");
  revalidatePath("/admin/einstellungen");
}
