import Link from "next/link";

import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
import { listSalesPipeline } from "@/modules/platform/sales-crm";
import { listPlatformTenants } from "@/modules/platform/tenant-directory";
import {
  salesStageLabels,
  type LeadStatus,
} from "@/modules/platform/sales-stages";

const formatter = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" });

function statusFor(lead: { status: string; convertedTenantId: string | null }) {
  if (lead.convertedTenantId)
    return { label: "Aktiver Kunde", tone: "success" as const };
  if (lead.status === "won")
    return { label: "Gewonnen · Einrichtung offen", tone: "warning" as const };
  if (lead.status === "lost")
    return { label: "Abgelehnt", tone: "danger" as const };
  return {
    label: salesStageLabels[lead.status as LeadStatus],
    tone: "info" as const,
  };
}

export default async function CustomerRecordsPage() {
  await requirePlatformPermission("platform.sales.manage");
  const [leads, tenants] = await Promise.all([
    listSalesPipeline(),
    listPlatformTenants(),
  ]);
  const linkedTenantIds = new Set(
    leads
      .map((lead) => lead.convertedTenantId)
      .filter((value): value is string => Boolean(value)),
  );
  const legacyTenants = tenants.filter(
    (tenant) => !linkedTenantIds.has(tenant.id),
  );
  const activeCustomers = leads.filter((lead) => lead.convertedTenantId).length;
  const openRelationships = leads.filter(
    (lead) => !["won", "lost"].includes(lead.status),
  ).length;

  return (
    <CustomerPage
      title="Kundenakten"
      description="Eine gemeinsame Akte pro Fahrschule – vom ersten Kontakt über Angebot und Einrichtung bis zur laufenden Instanz."
    >
      <section className="mb-7 overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-cyan-300">Zentrale Kundenübersicht</p>
            <h2 className="mt-2 text-3xl font-semibold">
              {leads.length + legacyTenants.length} Kundenakten
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Der farbige Status zeigt die aktuelle Phase. Angebot, Briefe,
              Kommunikation und spätere Instanz bleiben über dieselbe Akte
              nachvollziehbar.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950"
              href="/admin/akquise"
            >
              Akquise bearbeiten
            </Link>
            <Link
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold"
              href="/admin/mandanten"
            >
              Instanzen & Domains
            </Link>
          </div>
        </div>
        <dl className="mt-6 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-slate-400">Offene Beziehungen</dt>
            <dd className="mt-1 text-xl font-semibold">{openRelationships}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Aktive Kunden</dt>
            <dd className="mt-1 text-xl font-semibold text-emerald-300">
              {activeCustomers + legacyTenants.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Abgelehnt</dt>
            <dd className="mt-1 text-xl font-semibold">
              {leads.filter((lead) => lead.status === "lost").length}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {leads.map((lead) => {
          const status = statusFor(lead);
          const tenant = lead.convertedTenantId
            ? tenants.find((item) => item.id === lead.convertedTenantId)
            : null;
          return (
            <Card key={lead.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{lead.companyName}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {lead.contactName || "Ansprechperson noch offen"}
                  </p>
                </div>
                <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
              </div>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Kontakt</dt>
                  <dd className="mt-1 font-semibold">
                    {lead.email || lead.phone || "Noch offen"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Letzte Änderung</dt>
                  <dd className="mt-1 font-semibold">
                    {formatter.format(lead.updatedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Paket</dt>
                  <dd className="mt-1 font-semibold">
                    {tenant?.planName || "Noch nicht zugewiesen"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Domain</dt>
                  <dd className="mt-1 font-semibold">
                    {tenant?.domain || "Noch keine aktive Instanz"}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                  href={`/admin/akquise/${lead.id}`}
                >
                  Kundenakte öffnen
                </Link>
                {lead.convertedTenantId ? (
                  <Link
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"
                    href={`/admin/mandanten/${lead.convertedTenantId}`}
                  >
                    Instanz verwalten
                  </Link>
                ) : lead.status === "won" ? (
                  <Link
                    className="rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-950"
                    href={`/admin/mandanten/neu?lead=${lead.id}`}
                  >
                    Instanz vorbereiten
                  </Link>
                ) : null}
              </div>
            </Card>
          );
        })}
        {legacyTenants.map((tenant) => (
          <Card key={tenant.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{tenant.name}</h2>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  {tenant.customerNumber}
                </p>
              </div>
              <StatusBadge tone="success">Aktiver Kunde</StatusBadge>
            </div>
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              Ältere Kundenakte ohne verknüpften Akquiseverlauf.
            </p>
            <Link
              className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              href={`/admin/mandanten/${tenant.id}`}
            >
              Kundeninstanz öffnen
            </Link>
          </Card>
        ))}
      </div>
    </CustomerPage>
  );
}
