import { CustomerPage } from "@/components/customer/customer-page";
import { MaintenanceForm } from "@/components/setup/maintenance-form";
import { logoutAction } from "@/modules/auth/actions";
import { hasTenantPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import { tenantHasPublishedLegalDocuments } from "@/modules/legal/repository";
import { findTenantMaintenance } from "@/modules/setup/maintenance";
import { createMembershipTenantContext } from "@/modules/tenancy/tenant-context";

import { saveTenantMaintenance } from "./actions";
import { isTenantFeatureEnabled } from "@/modules/features/access";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  if (!membership) redirect("/login");
  if (
    !(await isTenantFeatureEnabled(membership.tenantId, "maintenance_preview"))
  )
    redirect("/kunde/funktionen?feature=maintenance_preview");
  const canManage = Boolean(
    membership &&
    hasTenantPermission(membership.role, "tenant.settings.manage"),
  );
  const context =
    identity && membership
      ? createMembershipTenantContext({
          requestedTenantId: membership.tenantId,
          userId: identity.id,
          activeTenantIds: identity.memberships.map((item) => item.tenantId),
        })
      : null;
  const [settings, legalReady] = context
    ? await Promise.all([
        findTenantMaintenance(context),
        tenantHasPublishedLegalDocuments(context.tenantId),
      ])
    : [null, false];
  return (
    <CustomerPage
      title="Allgemeine Einstellungen"
      description="Grunddaten gelten ausschließlich für den aktuellen Mandanten."
    >
      {settings ? (
        canManage ? (
          <MaintenanceForm
            action={saveTenantMaintenance}
            legalHref="/kunde/rechtliches"
            legalReady={legalReady}
            maintenanceMessage={settings.maintenanceMessage}
            maintenanceMode={settings.maintenanceMode}
            tenant
          />
        ) : (
          <p className="max-w-2xl rounded-2xl border bg-white p-6 text-sm text-slate-600">
            Nur der Mandanten-Owner darf diese Einstellung ändern.
          </p>
        )
      ) : (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          Für diesen Mandanten wurden noch keine Website-Einstellungen angelegt.
        </p>
      )}
      <form action={logoutAction} className="mt-8">
        <button
          className="rounded-xl border bg-white px-4 py-3 font-semibold"
          type="submit"
        >
          Abmelden
        </button>
      </form>
    </CustomerPage>
  );
}
