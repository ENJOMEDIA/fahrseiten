"use server";

import { submitPostalCampaignResponse } from "@/modules/platform/postal-campaign";

export type PostalResponseState = {
  status: "idle" | "success" | "error";
  message?: string;
  response?: "interested" | "unsure" | "declined";
};

export async function submitPostalResponseAction(
  _state: PostalResponseState,
  formData: FormData,
): Promise<PostalResponseState> {
  try {
    const result = await submitPostalCampaignResponse({
      leadId: formData.get("leadId"),
      token: formData.get("token"),
      response: formData.get("response"),
      email: String(formData.get("email") ?? "").trim(),
      acknowledged: formData.get("acknowledged") === "yes",
      emailConsent: formData.get("emailConsent") === "yes",
    });
    return {
      status: "success",
      response: result.response,
      message:
        result.response === "declined"
          ? "Danke für die Rückmeldung. Der Kontakt wurde dauerhaft für weitere Akquise gesperrt."
          : "Danke! Wir haben eine Bestätigungs-E-Mail gesendet. Erst nach deiner Bestätigung folgen die gewünschten Informationen.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Die Auswahl konnte nicht gespeichert werden.",
    };
  }
}
