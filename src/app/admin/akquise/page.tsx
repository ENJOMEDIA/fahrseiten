import Link from "next/link";

import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
import { listSalesPipeline } from "@/modules/platform/sales-crm";
import { listPendingInstanceSetups } from "@/modules/platform/tenant-directory";
import { postalCampaignUrl } from "@/modules/platform/postal-campaign";
import {
  salesStageLabels,
  salesStages,
  type LeadStatus,
} from "@/modules/platform/sales-stages";
import { CreateLeadForm, LeadControls } from "./sales-forms";
import { SalesNav } from "./sales-nav";

const formatter = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function SalesPage() {
  await requirePlatformPermission("platform.sales.manage");
  const [leads, pendingSetups] = await Promise.all([
    listSalesPipeline(),
    listPendingInstanceSetups(),
  ]);
  const due = leads.filter(
    (lead) =>
      lead.nextTaskAt &&
      lead.nextTaskAt <= new Date() &&
      !["won", "lost"].includes(lead.status),
  ).length;
  const activeLeads = leads.filter(
    (lead) => !["won", "lost"].includes(lead.status),
  );
  const withoutNextStep = activeLeads.filter((lead) => !lead.nextTaskAt).length;
  const workQueue = activeLeads
    .filter((lead) => !lead.nextTaskAt || lead.nextTaskAt <= new Date())
    .sort((left, right) => {
      if (!left.nextTaskAt && !right.nextTaskAt) return 0;
      if (!left.nextTaskAt) return 1;
      if (!right.nextTaskAt) return -1;
      return left.nextTaskAt.getTime() - right.nextTaskAt.getTime();
    })
    .slice(0, 6);
  return (
    <CustomerPage
      title="Akquise-CRM"
      description="Echte Website-Anfragen und manuell erfasste Kontakte vom Erstkontakt bis zum Abschluss verwalten."
    >
      <SalesNav />
      {pendingSetups.length ? (
        <Card className="mb-6 border-cyan-200 bg-cyan-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[.16em] text-cyan-700 uppercase">
                Instanzeinrichtung
              </p>
              <h2 className="mt-1 font-semibold">
                {pendingSetups.length} vorbereitete Instanz(en) warten auf
                Abschluss
              </h2>
            </div>
            <Link
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              href="/admin/mandanten"
            >
              Status ansehen →
            </Link>
          </div>
        </Card>
      ) : null}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="surface-lift">
          <p className="text-sm text-slate-500">Kundenakten im Vertrieb</p>
          <p className="mt-1 text-3xl font-semibold">{leads.length}</p>
        </Card>
        <Card className="surface-lift">
          <p className="text-sm text-slate-500">Fällige Wiedervorlagen</p>
          <p
            className={`mt-1 text-3xl font-semibold ${due ? "text-amber-700" : "text-emerald-700"}`}
          >
            {due}
          </p>
        </Card>
        <Card className="surface-lift">
          <p className="text-sm text-slate-500">Gewonnen</p>
          <p className="mt-1 text-3xl font-semibold">
            {leads.filter((lead) => lead.status === "won").length}
          </p>
        </Card>
        <Card className="surface-lift">
          <p className="text-sm text-slate-500">Ohne nächsten Schritt</p>
          <p
            className={`mt-1 text-3xl font-semibold ${withoutNextStep ? "text-orange-700" : "text-emerald-700"}`}
          >
            {withoutNextStep}
          </p>
        </Card>
      </div>
      <section className="mb-7 overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[.16em] text-cyan-300 uppercase">
              Dein Arbeitsbereich
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Heute im Blick behalten
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Fällige Wiedervorlagen stehen zuerst. Kontakte ohne Termin folgen,
              damit keine Anfrage zwischen anderen Projekten liegen bleibt.
            </p>
          </div>
          <Link
            className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
            href="/admin/akquise/kontakte"
          >
            E-Mail-Versand öffnen →
          </Link>
        </div>
        {workQueue.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workQueue.map((lead) => (
              <article
                className="rounded-2xl border border-white/10 bg-white/7 p-4"
                key={lead.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{lead.companyName}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {lead.contactName ||
                        salesStageLabels[lead.status as LeadStatus]}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${lead.nextTaskAt ? "bg-amber-300 text-amber-950" : "bg-white/10 text-slate-200"}`}
                  >
                    {lead.nextTaskAt ? "Fällig" : "Termin fehlt"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  {lead.phone ? (
                    <a
                      className="rounded-lg bg-white px-3 py-2 text-slate-950"
                      href={`tel:${lead.phone}`}
                    >
                      Anrufen
                    </a>
                  ) : null}
                  {lead.email ? (
                    <a
                      className="rounded-lg border border-white/20 px-3 py-2"
                      href={`mailto:${lead.email}`}
                    >
                      E-Mail
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-emerald-400/15 p-4 text-sm text-emerald-200">
            Alles geplant – aktuell ist keine Wiedervorlage fällig.
          </p>
        )}
      </section>
      <CreateLeadForm />
      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {salesStages.map((status) => (
          <section
            className="min-h-48 rounded-2xl bg-slate-200/65 p-3"
            key={status}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">
                {salesStageLabels[status]}
              </h2>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold">
                {leads.filter((lead) => lead.status === status).length}
              </span>
            </div>
            {leads
              .filter((lead) => lead.status === status)
              .map((lead) => (
                <Card className="mt-3 p-4" key={lead.id}>
                  <StatusBadge
                    tone={
                      lead.source === "marketing_website" ? "info" : "neutral"
                    }
                  >
                    {lead.source === "marketing_website"
                      ? "Website-Anfrage"
                      : "Manuell"}
                  </StatusBadge>
                  <h3 className="mt-3 font-semibold">{lead.companyName}</h3>
                  <Link
                    className="mt-2 inline-flex text-xs font-semibold text-cyan-800"
                    href={`/admin/akquise/${lead.id}`}
                  >
                    Kundenakte öffnen →
                  </Link>
                  {lead.contactName ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {lead.contactName}
                    </p>
                  ) : null}
                  {lead.email ? (
                    <a
                      className="mt-3 block truncate text-xs font-semibold text-cyan-800"
                      href={`mailto:${lead.email}`}
                    >
                      {lead.email}
                    </a>
                  ) : null}
                  {lead.phone ? (
                    <a
                      className="mt-1 block text-xs font-semibold text-cyan-800"
                      href={`tel:${lead.phone}`}
                    >
                      {lead.phone}
                    </a>
                  ) : null}
                  {lead.nextTaskAt ? (
                    <p
                      className={`mt-3 rounded-lg px-2 py-1 text-xs ${lead.nextTaskAt <= new Date() && !["won", "lost"].includes(lead.status) ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600"}`}
                    >
                      Wiedervorlage: {formatter.format(lead.nextTaskAt)}
                    </p>
                  ) : null}
                  {lead.latestActivity?.note ? (
                    <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-600">
                      {lead.latestActivity.note}
                    </p>
                  ) : null}
                  {lead.latestOutreach ? (
                    <p
                      className={`mt-3 rounded-lg px-2 py-1 text-xs font-semibold ${lead.latestOutreach.status === "completed" ? "bg-emerald-100 text-emerald-900" : lead.latestOutreach.status === "failed" ? "bg-red-100 text-red-900" : "bg-amber-100 text-amber-900"}`}
                    >
                      {lead.latestOutreach.status === "completed"
                        ? "E-Mail vom SMTP-Server angenommen"
                        : lead.latestOutreach.status === "failed"
                          ? `E-Mail fehlgeschlagen${lead.latestOutreach.lastErrorCode ? `: ${lead.latestOutreach.lastErrorCode}` : ""}`
                          : "E-Mail-Versand wartet"}
                    </p>
                  ) : null}
                  {lead.status === "won" && !lead.convertedTenantId ? (
                    <Link
                      className="mt-3 inline-flex rounded-xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-900"
                      href={`/admin/mandanten/neu?lead=${lead.id}`}
                    >
                      Instanz vorbereiten →
                    </Link>
                  ) : null}
                  {lead.convertedTenantId ? (
                    <Link
                      className="mt-3 inline-flex text-xs font-semibold text-cyan-800"
                      href={`/admin/mandanten/${lead.convertedTenantId}`}
                    >
                      Mandant öffnen →
                    </Link>
                  ) : null}
                  <LeadControls
                    lead={{
                      id: lead.id,
                      companyName: lead.companyName,
                      status: lead.status as LeadStatus,
                      nextTaskAt: lead.nextTaskAt,
                      emailPermission: lead.emailPermission,
                      emailPermissionEvidence: lead.emailPermissionEvidence,
                      emailOptOutAt: lead.emailOptOutAt,
                      postalResponse: lead.postalResponse,
                      campaignUrl: postalCampaignUrl(lead.id),
                      street: lead.street,
                      postalCode: lead.postalCode,
                      city: lead.city,
                      country: lead.country,
                    }}
                  />
                </Card>
              ))}
            {leads.every((lead) => lead.status !== status) ? (
              <p className="mt-4 text-xs text-slate-500">Noch keine Kontakte</p>
            ) : null}
          </section>
        ))}
      </div>
    </CustomerPage>
  );
}
