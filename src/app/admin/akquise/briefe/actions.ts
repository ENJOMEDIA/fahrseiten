"use server";

import { revalidatePath } from "next/cache";

import {
  preparePostalDispatch,
  submitPreparedPostalDispatch,
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
