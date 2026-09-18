"use server";

import { redirect } from "next/navigation";

import { confirmPostalEmail } from "@/modules/platform/postal-campaign";

export async function confirmPostalEmailAction(formData: FormData) {
  const leadId = String(formData.get("lead") ?? "");
  const token = String(formData.get("token") ?? "");
  try {
    await confirmPostalEmail(leadId, token);
  } catch {
    redirect("/brief/bestaetigen?status=invalid");
  }
  redirect("/brief/bestaetigen?status=success");
}
