"use server";

import { revalidatePath } from "next/cache";

import {
  createManualLead,
  deleteSalesLead,
  deleteSalesLeadsBatch,
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
import { queueSalesNewsletter } from "@/modules/platform/sales-newsletter";

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
        street: formData.get("street"),
        postalCode: formData.get("postalCode"),
        city: formData.get("city"),
        country: formData.get("country"),
        tags: formData.get("tags"),
        researchNote: formData.get("researchNote"),
        note: formData.get("note"),
        nextTaskAt: formData.get("nextTaskAt"),
        emailPermission: formData.get("emailPermission"),
        emailPermissionEvidence: formData.get("emailPermissionEvidence"),
      },
      identity.id,
    );
    revalidatePath("/admin/akquise");
    return { message: "Die Kundenakte wurde angelegt.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Die Kundenakte konnte nicht angelegt werden.",
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
    if (formData.get("contactPermissionConfirmed") !== "yes")
      throw new Error(
        "Bitte bestätige vor dem Versand, dass die Kontaktaufnahme für alle ausgewählten Empfänger geprüft wurde.",
      );
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

export async function queueNewsletterAction(
  _state: SalesActionState,
  formData: FormData,
): Promise<SalesActionState> {
  const identity = await requirePlatformPermission("platform.sales.manage");
  try {
    if (formData.get("newsletterPermissionConfirmed") !== "yes")
      throw new Error(
        "Bitte bestätige die dokumentierte Newsletter-Einwilligung aller ausgewählten Empfänger.",
      );
    const result = await queueSalesNewsletter({
      name: formData.get("name"),
      subjectTemplate: formData.get("subjectTemplate"),
      bodyTemplate: formData.get("bodyTemplate"),
      styleKey: formData.get("styleKey"),
      leadIds: formData.getAll("leadIds").map(String),
      actorUserId: identity.id,
    });
    revalidatePath("/admin/akquise/newsletter");
    revalidatePath("/admin/akquise");
    return {
      message: `Newsletter wurde für ${result.recipientCount} Empfänger zum Versand eingeplant. Der Cronjob verarbeitet die Warteschlange.`,
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Newsletter konnte nicht eingeplant werden.",
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
      companyName: String(formData.get("companyName") ?? ""),
      contactName: String(formData.get("contactName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      website: String(formData.get("website") ?? ""),
      tags: String(formData.get("tags") ?? ""),
      researchNote: String(formData.get("researchNote") ?? ""),
      status: String(formData.get("status")) as LeadStatus,
      nextTaskAt: String(formData.get("nextTaskAt") ?? ""),
      note: String(formData.get("note") ?? ""),
      actorUserId: identity.id,
      emailPermission: String(formData.get("emailPermission") ?? "unknown"),
      emailPermissionEvidence: String(
        formData.get("emailPermissionEvidence") ?? "",
      ),
      street: String(formData.get("street") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      city: String(formData.get("city") ?? ""),
      country: String(formData.get("country") ?? "Deutschland"),
    });
    revalidatePath("/admin/akquise");
    revalidatePath("/admin/akquise/kontakte");
    revalidatePath(`/admin/akquise/${String(formData.get("id"))}`);
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

export async function deleteLeadBatchAction(
  _state: SalesActionState,
  formData: FormData,
): Promise<SalesActionState> {
  await requirePlatformPermission("platform.sales.manage");
  try {
    const result = await deleteSalesLeadsBatch({
      ids: formData.getAll("leadIds").map(String),
      confirmation: String(formData.get("confirmation") ?? ""),
    });
    revalidatePath("/admin/akquise");
    revalidatePath("/admin/akquise/kontakte");
    const missingMessage = result.missing
      ? ` ${result.missing} Einträge waren bereits nicht mehr vorhanden.`
      : "";
    return {
      message: result.failed.length
        ? `${result.deleted.length} Kontakte gelöscht. ${result.failed.length} konnten nicht gelöscht werden: ${result.failed
            .slice(0, 3)
            .map((item) => `${item.companyName}: ${item.reason}`)
            .join(" · ")}${missingMessage}`
        : `${result.deleted.length} Kontakte wurden vollständig gelöscht.${missingMessage}`,
      error: result.failed.length > 0 || result.missing > 0,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Die ausgewählten Kontakte konnten nicht gelöscht werden.",
      error: true,
    };
  }
}

export async function deleteLeadAction(
  _state: SalesActionState,
  formData: FormData,
): Promise<SalesActionState> {
  await requirePlatformPermission("platform.sales.manage");
  try {
    const result = await deleteSalesLead({
      id: String(formData.get("id") ?? ""),
      confirmation: String(formData.get("confirmation") ?? ""),
    });
    revalidatePath("/admin/akquise");
    revalidatePath("/admin/akquise/kontakte");
    return {
      message: result.mediaCleanupFailed
        ? `„${result.companyName}“ wurde gelöscht. ${result.mediaCleanupFailed} PDF-Datei(en) müssen technisch aus dem Speicher entfernt werden.`
        : `„${result.companyName}“ wurde mit Aktivitäten, Versanddaten und lokalen PDFs gelöscht.`,
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Der Akquise-Kontakt konnte nicht gelöscht werden.",
      error: true,
    };
  }
}
