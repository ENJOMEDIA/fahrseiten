"use server";

import { revalidatePath } from "next/cache";

import { runNotificationScheduler } from "@/modules/notifications/runtime";
import { requirePlatformPermission } from "@/modules/platform/access";

export async function processPendingInvitations() {
  await requirePlatformPermission("platform.tenants.manage");
  await runNotificationScheduler();
  revalidatePath("/admin/mandanten");
  revalidatePath("/admin/akquise");
}
