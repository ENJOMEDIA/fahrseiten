"use server";

import { revalidatePath } from "next/cache";

import {
  deletePostalDispatch,
  preparePostalDispatch,
  setPostalDispatchArchived,
  submitPreparedPostalDispatch,
  syncPostalDispatchStatuses,
} from "@/modules/onlinebrief/service";
import { requirePlatformPermission } from "@/modules/platform/access";

export type PostalActionState = { message: string; error: boolean };

export async function preparePostalDispatchAction(
  _state: PostalActionState,
  formData: FormData,
): Promise<PostalActionState> {
  const identity = await requirePlatformPermission("platform.sales.manage");
  try {
    await preparePostalDispatch({
      leadId: String(formData.get("leadId") ?? ""),
      actorUserId: identity.id,
      color: formData.get("color") === "yes",
      kicker: String(formData.get("kicker") ?? ""),
      headline: String(formData.get("headline") ?? ""),
      bodyText: String(formData.get("bodyText") ?? ""),
      imageMediaId: String(formData.get("imageMediaId") ?? ""),
    });
    revalidatePath("/admin/akquise/briefe");
    revalidatePath("/admin/akquise");
    return {
      message: "Der personalisierte Brief wurde als PDF vorbereitet.",
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Der Brief konnte nicht vorbereitet werden.",
      error: true,
    };
  }
}

export async function deletePostalDispatchAction(
  _state: PostalActionState,
  formData: FormData,
): Promise<PostalActionState> {
  const identity = await requirePlatformPermission("platform.sales.manage");
  try {
    const result = await deletePostalDispatch({
      dispatchId: String(formData.get("dispatchId") ?? ""),
      actorUserId: identity.id,
    });
    revalidatePath("/admin/akquise/briefe");
    revalidatePath("/admin/akquise");
    return {
      message: result.providerDeleted
        ? "Der OnlineBrief24-Auftrag und das lokale PDF wurden gelöscht."
        : "Der lokale Briefentwurf wurde gelöscht.",
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Der Briefvorgang konnte nicht gelöscht werden.",
      error: true,
    };
  }
}

export async function submitPostalDispatchAction(
  _state: PostalActionState,
  formData: FormData,
): Promise<PostalActionState> {
  const identity = await requirePlatformPermission("platform.sales.manage");
  try {
    const jobId = await submitPreparedPostalDispatch({
      dispatchId: String(formData.get("dispatchId") ?? ""),
      actorUserId: identity.id,
      liveConfirmation: String(formData.get("liveConfirmation") ?? ""),
    });
    revalidatePath("/admin/akquise/briefe");
    revalidatePath("/admin/akquise");
    return {
      message: `OnlineBrief24-Auftrag ${jobId} wurde übertragen.`,
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Die Übertragung an OnlineBrief24 ist fehlgeschlagen.",
      error: true,
    };
  }
}

export async function archivePostalDispatchAction(
  _state: PostalActionState,
  formData: FormData,
): Promise<PostalActionState> {
  const identity = await requirePlatformPermission("platform.sales.manage");
  try {
    const archived = formData.get("archived") === "yes";
    await setPostalDispatchArchived({
      dispatchId: String(formData.get("dispatchId") ?? ""),
      archived,
      actorUserId: identity.id,
    });
    revalidatePath("/admin/akquise/briefe");
    return {
      message: archived
        ? "Der Briefvorgang wurde archiviert."
        : "Der Briefvorgang ist wieder aktiv.",
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Der Archivstatus konnte nicht geändert werden.",
      error: true,
    };
  }
}

export async function syncPostalStatusesAction(
  _state: PostalActionState,
  formData: FormData,
): Promise<PostalActionState> {
  await requirePlatformPermission("platform.sales.manage");
  try {
    const dispatchId = String(formData.get("dispatchId") ?? "") || undefined;
    const result = await syncPostalDispatchStatuses({
      dispatchId,
      force: true,
    });
    revalidatePath("/admin/akquise/briefe");
    return {
      message: result.checked
        ? `${result.checked} Auftrag geprüft, ${result.updated} Statusänderung erkannt${result.failed ? `, ${result.failed} Abfrage fehlgeschlagen` : ""}.`
        : "Es gibt aktuell keinen übertragenen Auftrag zum Prüfen.",
      error: result.failed > 0,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Der OnlineBrief24-Status konnte nicht geprüft werden.",
      error: true,
    };
  }
}
