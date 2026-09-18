"use server";

import { redirect } from "next/navigation";

import { unsubscribeSalesLead } from "@/modules/platform/sales-unsubscribe";

export async function unsubscribeAction(formData: FormData) {
  const leadId = String(formData.get("lead") ?? "");
  const token = String(formData.get("token") ?? "");
  try {
    await unsubscribeSalesLead(leadId, token);
  } catch {
    redirect("/akquise/abmelden?status=invalid");
  }
  redirect("/akquise/abmelden?status=success");
}
