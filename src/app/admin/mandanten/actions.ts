"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { runNotificationScheduler } from "@/modules/notifications/runtime";
import { requirePlatformPermission } from "@/modules/platform/access";
import {
  cancelPendingInstanceSetup,
  resendPendingInstanceInvitation,
} from "@/modules/platform/tenant-directory";
import { findInstanceInvitationStatus } from "@/modules/setup/tenant-onboarding";

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

export async function cancelPendingInstanceAction(
  _state: InvitationProcessingState,
  formData: FormData,
): Promise<InvitationProcessingState> {
  const identity = await requirePlatformPermission("platform.tenants.manage");
  let result: Awaited<ReturnType<typeof cancelPendingInstanceSetup>>;
  try {
    result = await cancelPendingInstanceSetup({
      setupId: String(formData.get("setupId") ?? ""),
      confirmation: String(formData.get("confirmation") ?? ""),
      actorUserId: identity.id,
    });
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Die vorbereitete Instanz konnte nicht storniert werden.",
      error: true,
    };
  }
  revalidatePath("/admin/mandanten");
  revalidatePath("/admin/akquise");
  redirect(
    `/admin/mandanten?setupCancelled=${encodeURIComponent(result.displayName)}`,
  );
}

export async function resendPendingInstanceAction(
  _state: InvitationProcessingState,
  formData: FormData,
): Promise<InvitationProcessingState> {
  const identity = await requirePlatformPermission("platform.tenants.manage");
  const setupId = String(formData.get("setupId") ?? "");
  let result: Awaited<ReturnType<typeof resendPendingInstanceInvitation>>;
  try {
    result = await resendPendingInstanceInvitation({
      setupId,
      actorUserId: identity.id,
    });
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Der Einrichtungslink konnte nicht neu erstellt werden.",
      error: true,
    };
  }

  try {
    await runNotificationScheduler();
  } catch {
    // Der Job bleibt gespeichert und wird vom Cron erneut verarbeitet.
  }
  const status = await findInstanceInvitationStatus(setupId);
  revalidatePath("/admin/mandanten");
  revalidatePath("/admin/akquise");

  if (status?.status === "completed")
    return {
      message: `Neuer Link für „${result.displayName}“ wurde versendet. Der vorherige Link ist ungültig.`,
      error: false,
    };
  return {
    message: `Neuer Link für „${result.displayName}“ wurde erstellt und für den Versand eingeplant. Der vorherige Link ist ungültig.`,
    error: false,
  };
}
