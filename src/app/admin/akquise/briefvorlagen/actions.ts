"use server";

import { revalidatePath } from "next/cache";

import { savePostalLetterTemplate } from "@/modules/onlinebrief/templates";
import { requirePlatformPermission } from "@/modules/platform/access";

export type LetterTemplateActionState = { message: string; error: boolean };

export async function saveLetterTemplateAction(
  _state: LetterTemplateActionState,
  formData: FormData,
): Promise<LetterTemplateActionState> {
  const identity = await requirePlatformPermission("platform.sales.manage");
  try {
    await savePostalLetterTemplate(
      {
        name: formData.get("name"),
        headlineTemplate: formData.get("headlineTemplate"),
        bodyTemplate: formData.get("bodyTemplate"),
        active: true,
      },
      identity.id,
    );
    revalidatePath("/admin/akquise/briefvorlagen");
    revalidatePath("/admin/akquise/briefe");
    return { message: "Die Briefvorlage wurde gespeichert.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Die Briefvorlage konnte nicht gespeichert werden.",
      error: true,
    };
  }
}
