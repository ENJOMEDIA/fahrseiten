import { notFound } from "next/navigation";

import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
import { findPlatformTenant } from "@/modules/platform/tenant-directory";

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

  const legalComplete =
    tenant.publishedLegal.has("imprint") &&
    tenant.publishedLegal.has("privacy");
  const domainComplete =
    tenant.domainStatus === "active" && tenant.sslStatus === "active";

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
    </CustomerPage>
  );
}
