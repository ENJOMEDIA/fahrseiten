import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
import { listSalesPipeline } from "@/modules/platform/sales-crm";
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
  const leads = await listSalesPipeline();
  const due = leads.filter(
    (lead) =>
      lead.nextTaskAt &&
      lead.nextTaskAt <= new Date() &&
      !["won", "lost"].includes(lead.status),
  ).length;
  return (
    <CustomerPage
      title="Akquise-CRM"
      description="Echte Website-Anfragen und manuell erfasste Kontakte vom Erstkontakt bis zum Abschluss verwalten."
    >
      <SalesNav />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="surface-lift">
          <p className="text-sm text-slate-500">Interessenten</p>
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
      </div>
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
                  {lead.status === "won" && !lead.convertedTenantId ? (
                    <Link
                      className="mt-3 inline-flex rounded-xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-900"
                      href="/admin/mandanten/neu"
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
                      status: lead.status as LeadStatus,
                      nextTaskAt: lead.nextTaskAt,
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
import Link from "next/link";
