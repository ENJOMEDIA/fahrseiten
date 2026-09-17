"use server";

import { revalidatePath } from "next/cache";

import { createManualLead, updateLead } from "@/modules/platform/sales-crm";
import type { LeadStatus } from "@/modules/platform/sales-stages";
import { requirePlatformPermission } from "@/modules/platform/access";

export type SalesActionState = { message: string; error: boolean };

export async function createLeadAction(
  _state: SalesActionState,
  formData: FormData,
): Promise<SalesActionState> {
  const identity = await requirePlatformPermission("platform.sales.manage");
  try {
    await createManualLead(
      {
        companyName: formData.get("companyName"),
        contactName: formData.get("contactName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        website: formData.get("website"),
        note: formData.get("note"),
        nextTaskAt: formData.get("nextTaskAt"),
      },
      identity.id,
    );
    revalidatePath("/admin/akquise");
    return { message: "Interessent wurde angelegt.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Interessent konnte nicht angelegt werden.",
      error: true,
    };
  }
}

export async function updateLeadAction(
  _state: SalesActionState,
  formData: FormData,
): Promise<SalesActionState> {
  const identity = await requirePlatformPermission("platform.sales.manage");
  try {
    await updateLead({
      id: String(formData.get("id")),
      status: String(formData.get("status")) as LeadStatus,
      nextTaskAt: String(formData.get("nextTaskAt") ?? ""),
      note: String(formData.get("note") ?? ""),
      actorUserId: identity.id,
    });
    revalidatePath("/admin/akquise");
    return { message: "Akquise-Stand wurde gespeichert.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Änderung konnte nicht gespeichert werden.",
      error: true,
    };
  }
}
