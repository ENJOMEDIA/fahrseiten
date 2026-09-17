"use server";

import { revalidatePath } from "next/cache";

import type { FeatureKey } from "@/modules/features/catalog";
import { requirePlatformPermission } from "@/modules/platform/access";
import { savePlatformPlan, updateAddonPrice } from "@/modules/platform/plans";

export type PricingActionState = { message: string; error: boolean };

export async function savePlanAction(
  _state: PricingActionState,
  formData: FormData,
): Promise<PricingActionState> {
  await requirePlatformPermission("platform.security.manage");
  try {
    await savePlatformPlan({
      id: String(formData.get("id") ?? "") || undefined,
      publicName: String(formData.get("publicName") ?? ""),
      description: String(formData.get("description") ?? ""),
      monthlyPrice: String(formData.get("monthlyPrice") ?? ""),
      setupPrice: String(formData.get("setupPrice") ?? ""),
      position: Number(formData.get("position") ?? 0),
      highlighted: formData.get("highlighted") === "on",
      active: formData.get("active") === "on",
      includedFeatures: formData.getAll("includedFeatures") as FeatureKey[],
    });
    revalidatePath("/admin/pakete");
    revalidatePath("/preise");
    return {
      message: "Paket und Leistungsumfang wurden gespeichert.",
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Paket konnte nicht gespeichert werden.",
      error: true,
    };
  }
}

export async function saveAddonAction(
  _state: PricingActionState,
  formData: FormData,
): Promise<PricingActionState> {
  await requirePlatformPermission("platform.security.manage");
  try {
    await updateAddonPrice({
      featureKey: String(formData.get("featureKey")) as FeatureKey,
      available: formData.get("available") === "on",
      price: String(formData.get("price") ?? ""),
    });
    revalidatePath("/admin/pakete");
    revalidatePath("/preise");
    return { message: "Modulpreis wurde gespeichert.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Modulpreis konnte nicht gespeichert werden.",
      error: true,
    };
  }
}
