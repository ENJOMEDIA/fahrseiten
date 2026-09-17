import { notFound } from "next/navigation";

import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
import { findPlatformTenant } from "@/modules/platform/tenant-directory";
import { getDnsTarget } from "@/modules/platform/domain-operations";
import { listPlatformPlans } from "@/modules/platform/plans";

import { DomainManagement, TenantPlanForm } from "./domain-management";
import { TenantDeleteForm } from "./tenant-delete-form";

const formatter = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" });

function Step({
  complete,
  children,
}: {
  complete: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className={complete ? "text-emerald-500" : "text-amber-400"}>
        {complete ? "✓" : "○"}
      </span>
      <span>{children}</span>
    </li>
  );
}

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePlatformPermission("platform.tenants.manage");
  const { id } = await params;
  const tenant = await findPlatformTenant(id);
  if (!tenant) notFound();
  const [dnsTarget, availablePlans] = await Promise.all([
    getDnsTarget().catch(() => ({
      hostname: "fahrseiten.de",
      ipv4: [] as string[],
      ipv6: [] as string[],
    })),
    listPlatformPlans(),
  ]);

  const legalComplete =
    tenant.publishedLegal.has("imprint") &&
    tenant.publishedLegal.has("privacy");
  const domainComplete =
    tenant.domainStatus === "active" && tenant.sslStatus === "active";
  const domainIsSubdomain = (tenant.domain?.split(".").length ?? 0) > 2;
  const dnsHost = domainIsSubdomain
    ? (tenant.domain?.split(".")[0] ?? "www")
    : "@";

  return (
    <CustomerPage
      title={tenant.name}
      description="Vom einmaligen Onboarding bis zur Freigabe der Website."
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="bg-slate-950 text-white">
          <p className="text-xs font-semibold tracking-wide text-cyan-300 uppercase">
            Onboarding-Fortschritt
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Der Kundenbereich wurde angelegt.
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            <Step complete>Mandant und geschützter Kundenbereich angelegt</Step>
            <Step complete={Boolean(tenant.ownerActive)}>
              Inhaberzugang{" "}
              {tenant.ownerEmail ? `für ${tenant.ownerEmail}` : "angelegt"}
            </Step>
            <Step complete={legalComplete}>
              Impressum und Datenschutz geprüft und veröffentlicht
            </Step>
            <Step complete={domainComplete}>
              Domain und SSL technisch freigegeben
            </Step>
            <Step complete={!tenant.maintenanceMode}>
              Öffentliche Website freigeschaltet
            </Step>
          </ul>
          <p className="mt-6 rounded-2xl bg-white/5 p-4 text-sm leading-6 text-slate-400">
            Der Einmallink richtet den Mandanten vollständig ein und wird danach
            ungültig. Der Kunde meldet sich anschließend über /login mit der im
            Formular festgelegten E-Mail und dem Passwort an.
          </p>
        </Card>
        <div className="grid gap-5">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Primäre Domain</p>
                <h2 className="mt-1 text-lg font-semibold">
                  {tenant.domain ?? "Noch nicht hinterlegt"}
                </h2>
              </div>
              <StatusBadge tone={domainComplete ? "success" : "warning"}>
                {tenant.domainStatus ?? "Offen"}
              </StatusBadge>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              SSL: {tenant.sslStatus ?? "unbekannt"}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Kundenkonto</p>
            <h2 className="mt-1 text-lg font-semibold">
              {tenant.ownerName ?? "Inhaber"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {tenant.ownerEmail ?? "Keine E-Mail gefunden"} · tenant_owner
            </p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Öffentlicher Zustand</p>
            <div className="mt-2">
              <StatusBadge
                tone={tenant.maintenanceMode ? "warning" : "success"}
              >
                {tenant.maintenanceMode
                  ? "Wartungsseite aktiv"
                  : "Website öffentlich"}
              </StatusBadge>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {tenant.maintenanceMessage}
            </p>
          </Card>
        </div>
      </div>
      <section className="mt-7 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-white p-6">
            <p className="text-xs font-semibold tracking-[.16em] text-cyan-800 uppercase">
              Externe Kundendomain
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              DNS ohne Anbieterwechsel verbinden
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Die Domain kann beim bisherigen Anbieter bleiben. Dort werden nur
              die Web-DNS-Einträge angepasst; E-Mail- und MX-Einträge bleiben
              unverändert.
            </p>
          </div>
          <div className="p-6">
            {tenant.domain && tenant.domainId ? (
              <DomainManagement
                domainId={tenant.domainId}
                hostname={tenant.domain}
                tenantId={tenant.id}
              />
            ) : (
              <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                Für diesen Mandanten wurde noch keine primäre Domain
                gespeichert.
              </p>
            )}
            <div className="mt-7 space-y-3">
              <h3 className="font-semibold">Einträge beim Domainanbieter</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-3">Host</th>
                      <th className="p-3">Typ</th>
                      <th className="p-3">Ziel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domainIsSubdomain ? (
                      <tr className="border-t border-slate-100">
                        <td className="p-3 font-mono">{dnsHost}</td>
                        <td className="p-3">CNAME</td>
                        <td className="p-3 font-mono">{dnsTarget.hostname}</td>
                      </tr>
                    ) : null}
                    {!domainIsSubdomain
                      ? dnsTarget.ipv4.map((address) => (
                          <tr
                            className="border-t border-slate-100"
                            key={address}
                          >
                            <td className="p-3 font-mono">@</td>
                            <td className="p-3">A</td>
                            <td className="p-3 font-mono">{address}</td>
                          </tr>
                        ))
                      : null}
                    {!domainIsSubdomain
                      ? dnsTarget.ipv6.map((address) => (
                          <tr
                            className="border-t border-slate-100"
                            key={address}
                          >
                            <td className="p-3 font-mono">@</td>
                            <td className="p-3">AAAA</td>
                            <td className="p-3 font-mono break-all">
                              {address}
                            </td>
                          </tr>
                        ))
                      : null}
                  </tbody>
                </table>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                Bei Anbietern mit ALIAS/ANAME oder CNAME-Flattening kann auch
                die Hauptdomain auf{" "}
                <span className="font-mono">{dnsTarget.hostname}</span> zeigen.
                Vorhandene MX-, SPF-, DKIM- und DMARC-Einträge nicht löschen.
                DNS-Änderungen können abhängig vom Anbieter mehrere Stunden
                benötigen.
              </p>
            </div>
          </div>
        </Card>
        <div className="grid gap-5">
          <Card>
            <p className="text-xs font-semibold tracking-[.14em] text-cyan-700 uppercase">
              Freigabeablauf
            </p>
            <ol className="mt-5 space-y-4 text-sm">
              {[
                "Domain beim Kunden oder Provider erfassen",
                "Angezeigte DNS-Einträge setzen",
                "DNS & SSL mit einem Klick prüfen",
                "Zertifikat in Plesk für die Domain bereitstellen",
                "Rechtstexte prüfen und Wartungsmodus beenden",
              ].map((item, index) => (
                <li className="flex gap-3" key={item}>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="pt-1 leading-5 text-slate-600">{item}</span>
                </li>
              ))}
            </ol>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Gebuchtes Paket</p>
            <p className="mt-1 text-xl font-semibold">
              {tenant.planName ?? "Noch nicht zugewiesen"}
            </p>
            <TenantPlanForm
              currentPlanName={tenant.planName}
              plans={availablePlans
                .filter((plan) => plan.active)
                .map(({ id, publicName }) => ({ id, publicName }))}
              tenantId={tenant.id}
            />
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Interne Kennung</p>
            <p className="mt-1 font-mono text-xs break-all">{tenant.id}</p>
            <p className="mt-3 text-xs text-slate-500">
              Zuletzt geändert: {formatter.format(tenant.updatedAt)}
            </p>
          </Card>
        </div>
      </section>
      <section className="mt-7 rounded-[2rem] border border-red-200 bg-red-50 p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[.16em] text-red-700 uppercase">
          Gefahrenbereich
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-red-950">
          Mandant löschen
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-red-900/80">
          Entfernt den Mandanten, seine Website, Domains, Inhalte,
          Kontaktanfragen, Rechtstexte, Medienzuordnungen und nicht mehr
          benötigte Kundenzugänge. Protokolle mit Aufbewahrungszweck verlieren
          ihre Mandantenzuordnung. Dieser Vorgang kann nicht rückgängig gemacht
          werden.
        </p>
        <TenantDeleteForm tenantId={tenant.id} tenantName={tenant.name} />
      </section>
    </CustomerPage>
  );
}
