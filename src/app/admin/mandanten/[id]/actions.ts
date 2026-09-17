"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformPermission } from "@/modules/platform/access";
import {
  checkAndPersistTenantDomain,
  updateTenantDomain,
} from "@/modules/platform/domain-operations";
import { assignTenantPlan } from "@/modules/platform/plans";

export type DomainActionState = { message: string; error: boolean };

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
      message: result.dnsMatches
        ? result.sslActive
          ? "DNS und HTTPS sind korrekt. Die Domain ist aktiv."
          : "DNS zeigt korrekt auf FahrSeiten. Das SSL-Zertifikat ist noch nicht aktiv."
        : "Die Domain zeigt noch nicht auf das FahrSeiten-Ziel. Prüfe die angezeigten DNS-Einträge.",
      error: !result.dnsMatches,
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
  await requirePlatformPermission("platform.tenants.manage");
  try {
    const tenantId = String(formData.get("tenantId"));
    await assignTenantPlan({
      tenantId,
      planId: String(formData.get("planId")),
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
