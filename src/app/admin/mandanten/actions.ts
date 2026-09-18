"use server";

import { revalidatePath } from "next/cache";

import { runNotificationScheduler } from "@/modules/notifications/runtime";
import { requirePlatformPermission } from "@/modules/platform/access";

export type InvitationProcessingState = { message: string; error: boolean };

export async function processPendingInvitations(
  previousState: InvitationProcessingState,
): Promise<InvitationProcessingState> {
  void previousState;
  await requirePlatformPermission("platform.tenants.manage");
  try {
    const result = await runNotificationScheduler();
    revalidatePath("/admin/mandanten");
    revalidatePath("/admin/akquise");
    if (!result.claimed)
      return {
        message: "Prüfung abgeschlossen: Aktuell wartet kein fälliger Versand.",
        error: false,
      };
    return {
      message: `Prüfung abgeschlossen: ${result.completed} versendet, ${result.failed} endgültig fehlgeschlagen, ${result.claimed - result.completed - result.failed} zur Wiederholung vorgemerkt.`,
      error: result.failed > 0,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? `Versandprüfung fehlgeschlagen: ${error.message}`
          : "Versandprüfung fehlgeschlagen.",
      error: true,
    };
  }
}
