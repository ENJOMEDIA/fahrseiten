import { CustomerPage } from "@/components/customer/customer-page";
import { logoutAction } from "@/modules/auth/actions";
import { hasTenantPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import { findTenantMaintenance } from "@/modules/setup/maintenance";
import { createMembershipTenantContext } from "@/modules/tenancy/tenant-context";

import { saveTenantMaintenance } from "./actions";

export default async function SettingsPage() {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  const canManage = Boolean(
    membership &&
    hasTenantPermission(membership.role, "tenant.settings.manage"),
  );
  const settings =
    identity && membership
      ? await findTenantMaintenance(
          createMembershipTenantContext({
            requestedTenantId: membership.tenantId,
            userId: identity.id,
            activeTenantIds: identity.memberships.map((item) => item.tenantId),
          }),
        )
      : null;
  return (
    <CustomerPage
      title="Allgemeine Einstellungen"
      description="Grunddaten gelten ausschließlich für den aktuellen Mandanten."
    >
      {settings ? (
        <form
          action={saveTenantMaintenance}
          className="max-w-2xl space-y-5 rounded-2xl border bg-white p-6"
        >
          <label className="flex items-start gap-3 font-semibold">
            <input
              className="mt-1 size-5"
              defaultChecked={settings.maintenanceMode}
              disabled={!canManage}
              name="enabled"
              type="checkbox"
            />
            <span>
              Wartungsmodus aktiv
              <span className="mt-1 block text-sm font-normal text-slate-600">
                Die Kundendomain zeigt eine Vorschauseite mit den hinterlegten
                Markenfarben.
              </span>
            </span>
          </label>
          <label className="block text-sm font-semibold">
            Vorschautext
            <textarea
              className="mt-2 min-h-32 w-full rounded-xl border p-3 font-normal disabled:bg-slate-100"
              defaultValue={settings.maintenanceMessage}
              disabled={!canManage}
              maxLength={500}
              minLength={10}
              name="message"
              required
            />
          </label>
          {canManage ? (
            <button
              className="rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white"
              type="submit"
            >
              Wartungsmodus speichern
            </button>
          ) : (
            <p className="text-sm text-slate-600">
              Nur der Mandanten-Owner darf diese Einstellung ändern.
            </p>
          )}
        </form>
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
