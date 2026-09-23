"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasTenantPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import {
  activateTenantReferralProgram,
  setTenantReferralProgramActive,
} from "@/modules/referrals/service";

export type ReferralActionState = { message: string; error: boolean };

async function referralActor() {
  const identity = await getSessionIdentity();
  if (!identity) redirect("/login");
  const membership = identity.memberships[0];
  if (
    !membership ||
    !hasTenantPermission(membership.role, "tenant.settings.manage")
  )
    throw new Error("Nur Inhaber dürfen das Empfehlungsprogramm verwalten.");
  return { actorUserId: identity.id, tenantId: membership.tenantId };
}

export async function activateReferralAction(
  _state: ReferralActionState,
): Promise<ReferralActionState> {
  void _state;
  try {
    await activateTenantReferralProgram(await referralActor());
    revalidatePath("/kunde/empfehlungen");
    return {
      message: "Dein persönlicher Empfehlungslink ist aktiv.",
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Aktivierung fehlgeschlagen.",
      error: true,
    };
  }
}

export async function setReferralActiveAction(
  _state: ReferralActionState,
  formData: FormData,
): Promise<ReferralActionState> {
  try {
    const actor = await referralActor();
    const active = formData.get("active") === "true";
    await setTenantReferralProgramActive({ ...actor, active });
    revalidatePath("/kunde/empfehlungen");
    return {
      message: active
        ? "Empfehlungslink ist wieder aktiv."
        : "Empfehlungslink wurde pausiert.",
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Änderung fehlgeschlagen.",
      error: true,
    };
  }
}
