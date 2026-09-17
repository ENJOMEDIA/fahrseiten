"use server";

import { revalidatePath } from "next/cache";

import {
  createManualLead,
  importSalesLeads,
  updateLead,
} from "@/modules/platform/sales-crm";
import type { LeadStatus } from "@/modules/platform/sales-stages";
import { requirePlatformPermission } from "@/modules/platform/access";
import { parseSalesCsv } from "@/modules/platform/sales-csv";
import {
  queueSalesOutreach,
  saveSalesEmailTemplate,
} from "@/modules/platform/sales-email";

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

export async function importSalesCsvAction(
  _state: SalesActionState,
  formData: FormData,
): Promise<SalesActionState> {
  const identity = await requirePlatformPermission("platform.sales.manage");
  try {
    const file = formData.get("file");
    if (!(file instanceof File) || !file.size)
      throw new Error("Bitte eine CSV-Datei auswählen.");
    if (file.size > 2_000_000)
      throw new Error("Die CSV-Datei darf höchstens 2 MB groß sein.");
    const result = await importSalesLeads(
      parseSalesCsv(await file.text()),
      identity.id,
    );
    revalidatePath("/admin/akquise");
    revalidatePath("/admin/akquise/kontakte");
    return {
      message: `${result.imported} Kontakte importiert${result.skipped ? `, ${result.skipped} Duplikate übersprungen` : ""}.`,
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "CSV-Import fehlgeschlagen.",
      error: true,
    };
  }
}

export async function saveSalesTemplateAction(
  _state: SalesActionState,
  formData: FormData,
): Promise<SalesActionState> {
  const identity = await requirePlatformPermission("platform.sales.manage");
  try {
    await saveSalesEmailTemplate(
      {
        name: formData.get("name"),
        subjectTemplate: formData.get("subjectTemplate"),
        bodyTemplate: formData.get("bodyTemplate"),
        active: true,
      },
      identity.id,
    );
    revalidatePath("/admin/akquise/vorlagen");
    return { message: "E-Mail-Vorlage wurde gespeichert.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Vorlage konnte nicht gespeichert werden.",
      error: true,
    };
  }
}

export async function startOutreachAction(
  _state: SalesActionState,
  formData: FormData,
): Promise<SalesActionState> {
  const identity = await requirePlatformPermission("platform.sales.manage");
  try {
    const count = await queueSalesOutreach({
      leadIds: formData.getAll("leadIds").map(String),
      templateId: String(formData.get("templateId")),
      actorUserId: identity.id,
    });
    revalidatePath("/admin/akquise");
    revalidatePath("/admin/akquise/kontakte");
    return {
      message: `${count} personalisierte E-Mail${count === 1 ? "" : "s"} wurden zum Versand eingeplant.`,
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Akquise konnte nicht gestartet werden.",
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
