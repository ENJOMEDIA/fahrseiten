"use server";

import { revalidatePath } from "next/cache";

import {
  createSalesOffer,
  updateSalesOfferStatus,
} from "@/modules/offers/service";
import { requirePlatformPermission } from "@/modules/platform/access";

export type OfferActionState = { message: string; error: boolean };

export async function createSalesOfferAction(
  _state: OfferActionState,
  formData: FormData,
): Promise<OfferActionState> {
  const identity = await requirePlatformPermission("platform.sales.manage");
  try {
    await createSalesOffer({
      leadId: String(formData.get("leadId") ?? ""),
      actorUserId: identity.id,
      title: String(formData.get("title") ?? ""),
      validUntil: String(formData.get("validUntil") ?? ""),
      introduction: String(formData.get("introduction") ?? ""),
      descriptions: formData.getAll("description").map(String),
      quantities: formData.getAll("quantity").map(String),
      unitPrices: formData.getAll("unitPrice").map(String),
      vatRate: String(formData.get("vatRate") ?? "0"),
      smallBusinessExempt: formData.get("smallBusinessExempt") === "yes",
    });
    revalidatePath(`/admin/akquise/${formData.get("leadId")}`);
    revalidatePath("/admin/akquise");
    return { message: "Das Angebot wurde erstellt.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Das Angebot konnte nicht erstellt werden.",
      error: true,
    };
  }
}

export async function updateSalesOfferStatusAction(formData: FormData) {
  const identity = await requirePlatformPermission("platform.sales.manage");
  await updateSalesOfferStatus({
    offerId: String(formData.get("offerId") ?? ""),
    status: String(formData.get("status") ?? ""),
    actorUserId: identity.id,
  });
  revalidatePath(`/admin/akquise/${formData.get("leadId")}`);
  revalidatePath("/admin/akquise");
}
