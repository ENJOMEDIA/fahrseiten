"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformPermission } from "@/modules/platform/access";
import {
  creditReferral,
  qualifyReferral,
  rejectReferral,
} from "@/modules/referrals/service";

export type AdminReferralState = { message: string; error: boolean };

async function run(
  operation: (actorUserId: string) => Promise<void>,
): Promise<AdminReferralState> {
  try {
    const identity = await requirePlatformPermission(
      "platform.security.manage",
    );
    await operation(identity.id);
    revalidatePath("/admin/empfehlungen");
    revalidatePath("/kunde/empfehlungen");
    return {
      message: "Status wurde nachvollziehbar gespeichert.",
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Vorgang fehlgeschlagen.",
      error: true,
    };
  }
}

export async function qualifyReferralAction(
  _state: AdminReferralState,
  formData: FormData,
) {
  return run((actorUserId) =>
    qualifyReferral({
      referralId: String(formData.get("referralId")),
      actorUserId,
    }),
  );
}

export async function rejectReferralAction(
  _state: AdminReferralState,
  formData: FormData,
) {
  return run((actorUserId) =>
    rejectReferral({
      referralId: String(formData.get("referralId")),
      reason: String(formData.get("reason") ?? ""),
      actorUserId,
    }),
  );
}

export async function creditReferralAction(
  _state: AdminReferralState,
  formData: FormData,
) {
  return run((actorUserId) =>
    creditReferral({
      referralId: String(formData.get("referralId")),
      invoiceId: String(formData.get("invoiceId")),
      accountableConfirmed: formData.get("accountableConfirmed") === "on",
      actorUserId,
    }),
  );
}
