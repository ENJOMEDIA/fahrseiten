"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePlatformPermission } from "@/modules/platform/access";
import {
  saveBillingProfile,
  updateInvoiceStatus,
  updateSubscriptionSchedule,
  uploadInvoiceCopy,
} from "@/modules/billing/service";
import {
  checkAndPersistTenantDomain,
  updateTenantDomain,
} from "@/modules/platform/domain-operations";
import { assignTenantPlan } from "@/modules/platform/plans";
import { deletePlatformTenant } from "@/modules/platform/tenant-directory";
import {
  prepareContractDocument,
  sendContractForSignature,
} from "@/modules/contracts/service";

export type DomainActionState = { message: string; error: boolean };
export type TenantDeleteActionState = { message: string; error: boolean };

function parseDate(value: FormDataEntryValue | null) {
  if (!value) return null;
  const date = new Date(`${String(value)}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Ungültiges Datum.");
  return date;
}

export async function prepareContractAction(
  _state: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  const identity = await requirePlatformPermission("platform.tenants.manage");
  const tenantId = String(formData.get("tenantId") ?? "");
  try {
    const contract = await prepareContractDocument({
      tenantId,
      actorUserId: identity.id,
    });
    revalidatePath(`/admin/mandanten/${tenantId}`);
    revalidatePath("/kunde/abrechnung");
    return {
      message: `Vertrag ${contract.contractNumber} wurde unveränderlich vorbereitet.`,
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Vertrag konnte nicht vorbereitet werden.",
      error: true,
    };
  }
}

export async function sendContractForSignatureAction(
  _state: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  const identity = await requirePlatformPermission("platform.tenants.manage");
  const tenantId = String(formData.get("tenantId") ?? "");
  try {
    await sendContractForSignature({
      tenantId,
      documentId: String(formData.get("documentId") ?? ""),
      actorUserId: identity.id,
    });
    revalidatePath(`/admin/mandanten/${tenantId}`);
    revalidatePath("/kunde/abrechnung");
    return { message: "Signaturvorgang wurde gestartet.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Signaturvorgang konnte nicht gestartet werden.",
      error: true,
    };
  }
}

export async function saveBillingProfileAction(
  _state: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  const identity = await requirePlatformPermission("platform.tenants.manage");
  const tenantId = String(formData.get("tenantId") ?? "");
  try {
    await saveBillingProfile(
      {
        tenantId,
        useLocationAddress: formData.get("useLocationAddress") === "on",
        companyName: String(formData.get("companyName") ?? ""),
        recipientName: String(formData.get("recipientName") ?? ""),
        email: String(formData.get("email") ?? ""),
        street: String(formData.get("street") ?? ""),
        postalCode: String(formData.get("postalCode") ?? ""),
        city: String(formData.get("city") ?? ""),
        country: String(formData.get("country") ?? ""),
        vatId: String(formData.get("vatId") ?? ""),
      },
      identity.id,
    );
    revalidatePath(`/admin/mandanten/${tenantId}`);
    return { message: "Rechnungsanschrift wurde gespeichert.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Speichern fehlgeschlagen.",
      error: true,
    };
  }
}

export async function saveBillingScheduleAction(
  _state: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  const identity = await requirePlatformPermission("platform.tenants.manage");
  const tenantId = String(formData.get("tenantId") ?? "");
  try {
    await updateSubscriptionSchedule({
      tenantId,
      subscriptionId: String(formData.get("subscriptionId") ?? ""),
      minimumTermMonths: Number(formData.get("minimumTermMonths")),
      billingIntervalMonths: Number(formData.get("billingIntervalMonths")),
      nextInvoiceAt: parseDate(formData.get("nextInvoiceAt")),
      actorUserId: identity.id,
    });
    revalidatePath(`/admin/mandanten/${tenantId}`);
    revalidatePath("/kunde/abrechnung");
    return {
      message: "Laufzeit und Abrechnung wurden gespeichert.",
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Speichern fehlgeschlagen.",
      error: true,
    };
  }
}

export async function uploadInvoiceAction(
  _state: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  const identity = await requirePlatformPermission("platform.tenants.manage");
  const tenantId = String(formData.get("tenantId") ?? "");
  try {
    const file = formData.get("invoice");
    if (!(file instanceof File)) throw new Error("PDF-Datei fehlt.");
    await uploadInvoiceCopy({
      tenantId,
      invoiceNumber: String(formData.get("invoiceNumber") ?? ""),
      externalReference: String(formData.get("externalReference") ?? ""),
      issuedAt: parseDate(formData.get("issuedAt")) ?? new Date(),
      dueAt: parseDate(formData.get("dueAt")) ?? new Date(),
      grossAmount: String(formData.get("grossAmount") ?? ""),
      file,
      actorUserId: identity.id,
    });
    revalidatePath(`/admin/mandanten/${tenantId}`);
    revalidatePath("/kunde/abrechnung");
    return { message: "Rechnungskopie wurde hinterlegt.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Upload fehlgeschlagen.",
      error: true,
    };
  }
}

export async function updateInvoiceStatusAction(formData: FormData) {
  const identity = await requirePlatformPermission("platform.tenants.manage");
  const tenantId = String(formData.get("tenantId") ?? "");
  await updateInvoiceStatus({
    tenantId,
    invoiceId: String(formData.get("invoiceId") ?? ""),
    status: String(formData.get("status") ?? "open") as
      "open" | "paid" | "overdue" | "cancelled",
    actorUserId: identity.id,
  });
  revalidatePath(`/admin/mandanten/${tenantId}`);
  revalidatePath("/kunde/abrechnung");
}

export async function deleteTenantAction(
  _state: TenantDeleteActionState,
  formData: FormData,
): Promise<TenantDeleteActionState> {
  const identity = await requirePlatformPermission("platform.tenants.manage");
  let result: Awaited<ReturnType<typeof deletePlatformTenant>>;
  try {
    result = await deletePlatformTenant({
      tenantId: String(formData.get("tenantId") ?? ""),
      confirmation: String(formData.get("confirmation") ?? ""),
      actorUserId: identity.id,
    });
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Der Mandant konnte nicht gelöscht werden.",
      error: true,
    };
  }
  revalidatePath("/admin/mandanten");
  const query = new URLSearchParams({ deleted: result.deletedTenantName });
  if (result.failedMediaFiles > 0)
    query.set("mediaCleanup", String(result.failedMediaFiles));
  redirect(`/admin/mandanten?${query.toString()}`);
}

export async function checkDomainAction(
  _state: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  await requirePlatformPermission("platform.tenants.manage");
  try {
    const tenantId = String(formData.get("tenantId"));
    const result = await checkAndPersistTenantDomain({
      tenantId,
      domainId: String(formData.get("domainId")),
    });
    revalidatePath(`/admin/mandanten/${tenantId}`);
    revalidatePath("/admin/mandanten");
    return {
      message: !result.dnsMatches
        ? "Die Domain zeigt noch nicht auf das FahrSeiten-Ziel. Prüfe die angezeigten DNS-Einträge."
        : !result.appReachable
          ? "DNS zeigt auf den richtigen Server, aber die Domain erreicht noch nicht die FahrSeiten-App. Ordne sie in Plesk derselben Node.js-Anwendung wie fahrseiten.de zu und entferne alte Website-Zuordnungen."
          : result.sslActive
            ? "DNS, FahrSeiten-Routing und HTTPS sind korrekt. Die Domain ist aktiv."
            : "DNS und FahrSeiten-Routing funktionieren. Das SSL-Zertifikat ist noch nicht aktiv.",
      error: !result.dnsMatches || !result.appReachable,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Domainprüfung ist fehlgeschlagen.",
      error: true,
    };
  }
}

export async function assignPlanAction(
  _state: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  const identity = await requirePlatformPermission("platform.tenants.manage");
  try {
    const tenantId = String(formData.get("tenantId"));
    await assignTenantPlan({
      tenantId,
      planId: String(formData.get("planId")),
      actorUserId: identity.id,
    });
    revalidatePath(`/admin/mandanten/${tenantId}`);
    revalidatePath("/admin/mandanten");
    return { message: "Paket wurde dem Mandanten zugewiesen.", error: false };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Paket konnte nicht zugewiesen werden.",
      error: true,
    };
  }
}

export async function updateDomainAction(
  _state: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  await requirePlatformPermission("platform.tenants.manage");
  try {
    const tenantId = String(formData.get("tenantId"));
    await updateTenantDomain({
      tenantId,
      domainId: String(formData.get("domainId")),
      hostname: String(formData.get("hostname")),
    });
    revalidatePath(`/admin/mandanten/${tenantId}`);
    revalidatePath("/admin/mandanten");
    return {
      message: "Domain wurde gespeichert und muss erneut geprüft werden.",
      error: false,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Domain konnte nicht gespeichert werden.",
      error: true,
    };
  }
}
