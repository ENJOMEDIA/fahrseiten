import Link from "next/link";

import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
import { listPlatformTenants } from "@/modules/platform/tenant-directory";

const formatter = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" });

export default async function TenantsPage() {
  await requirePlatformPermission("platform.tenants.manage");
  const tenantRows = await listPlatformTenants();
  const activeDomains = tenantRows.filter(
    (tenant) => tenant.domainStatus === "active",
  ).length;
  const pendingDomains = tenantRows.filter(
    (tenant) => tenant.domain && tenant.domainStatus !== "active",
  ).length;
  const maintenanceSites = tenantRows.filter(
    (tenant) => tenant.maintenanceMode,
  ).length;

  return (
    <CustomerPage
      title="Mandanten"
      description="Alle eingerichteten Fahrschulen, Zugänge und Freigabeschritte an einem Ort."
    >
      <div className="mb-6 overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Kundenbestand</p>
            <p className="mt-1 text-3xl font-semibold">
              {tenantRows.length} Mandanten
            </p>
          </div>
          <Link
            className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-200"
            href="/admin/mandanten/neu"
          >
            + Onboarding-Link erstellen
          </Link>
        </div>
        <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">Domains aktiv</p>
            <p className="mt-1 text-xl font-semibold text-emerald-300">
              {activeDomains}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">DNS / SSL offen</p>
            <p className="mt-1 text-xl font-semibold text-amber-300">
              {pendingDomains}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Im Wartungsmodus</p>
            <p className="mt-1 text-xl font-semibold">{maintenanceSites}</p>
          </div>
        </div>
      </div>

      {tenantRows.length === 0 ? (
        <Card className="py-14 text-center">
          <p className="text-xl font-semibold">
            Noch keine Fahrschule eingerichtet
          </p>
          <p className="mx-auto mt-2 max-w-xl text-slate-600">
            Erstelle einen einmaligen Onboarding-Link. Sobald der Kunde das
            Formular abschließt, erscheint der Mandant automatisch hier.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {tenantRows.map((tenant) => (
            <Card
              className="group transition hover:-translate-y-0.5 hover:shadow-xl"
              key={tenant.id}
            >
              {(() => {
                const checks = [
                  Boolean(tenant.ownerEmail),
                  tenant.domainStatus === "active",
                  tenant.sslStatus === "active",
                  !tenant.maintenanceMode,
                ];
                const progress = Math.round(
                  (checks.filter(Boolean).length / checks.length) * 100,
                );
                return (
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Einrichtungsfortschritt</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Seit {formatter.format(tenant.createdAt)}
                  </p>
                  <h2 className="mt-2 truncate text-xl font-semibold">
                    {tenant.name}
                  </h2>
                  <p className="mt-1 truncate text-sm text-slate-600">
                    {tenant.domain ?? "Domain noch nicht hinterlegt"}
                  </p>
                </div>
                <StatusBadge
                  tone={tenant.status === "active" ? "success" : "warning"}
                >
                  {tenant.status === "active" ? "Aktiv" : tenant.status}
                </StatusBadge>
              </div>
              <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-slate-500">Inhaberzugang</p>
                  <p className="mt-1 truncate font-semibold">
                    {tenant.ownerEmail ?? "Noch offen"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Website</p>
                  <p className="mt-1 font-semibold">
                    {tenant.maintenanceMode
                      ? "Im Wartungsmodus"
                      : "Veröffentlicht"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">DNS / SSL</p>
                  <p className="mt-1 font-semibold">
                    {tenant.domainStatus ?? "Offen"} ·{" "}
                    {tenant.sslStatus ?? "unbekannt"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Paket</p>
                  <p className="mt-1 font-semibold">
                    {tenant.planName ?? "Noch nicht zugewiesen"}
                  </p>
                </div>
              </div>
              <Link
                className="mt-5 inline-flex font-semibold text-cyan-800"
                href={`/admin/mandanten/${tenant.id}`}
              >
                Onboarding und Details ansehen →
              </Link>
            </Card>
          ))}
        </div>
      )}
    </CustomerPage>
  );
}
