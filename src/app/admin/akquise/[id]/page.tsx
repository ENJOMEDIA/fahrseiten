import Link from "next/link";
import { notFound } from "next/navigation";

import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { listSalesOffers } from "@/modules/offers/service";
import {
  listPostalDispatches,
  onlinebriefConfiguration,
} from "@/modules/onlinebrief/service";
import { requirePlatformPermission } from "@/modules/platform/access";
import { listPlatformPlans } from "@/modules/platform/plans";
import { postalCampaignUrl } from "@/modules/platform/postal-campaign";
import { findSalesLeadDetail } from "@/modules/platform/sales-crm";
import {
  salesStageLabels,
  type LeadStatus,
} from "@/modules/platform/sales-stages";

import { LeadControls, LeadDeletePanel } from "../sales-forms";
import { SalesNav } from "../sales-nav";
import { updateSalesOfferStatusAction } from "./actions";
import { OfferEditor } from "./offer-editor";

const formatter = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
});
const money = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});
const activityLabels: Record<string, string> = {
  note: "Notiz",
  csv_import_note: "CSV-Import",
  postal_letter_prepared: "Brief vorbereitet",
  postal_letter_submitted: "Brief übertragen",
  postal_landing_opened: "QR-Link geöffnet",
  postal_response_pending: "Brief-Rückmeldung",
  postal_response_declined: "Weitere Ansprache abgelehnt",
  postal_email_confirmed: "E-Mail bestätigt",
  offer_created: "Angebot erstellt",
  offer_sent: "Angebot versendet",
  offer_accepted: "Angebot angenommen",
  offer_declined: "Angebot abgelehnt",
  instance_setup_created: "Instanz vorbereitet",
  tenant_created: "Kundeninstanz angelegt",
};

export default async function SalesLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePlatformPermission("platform.sales.manage");
  const { id } = await params;
  const lead = await findSalesLeadDetail(id);
  if (!lead) notFound();
  const [offers, dispatches, plans] = await Promise.all([
    listSalesOffers(id),
    listPostalDispatches(id),
    listPlatformPlans(),
  ]);
  const ob24 = onlinebriefConfiguration();
  return (
    <CustomerPage
      title={lead.companyName}
      description="Durchgängige Kundenakte von der ersten Ansprache bis zur laufenden Kundeninstanz."
    >
      <SalesNav />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          className="text-sm font-semibold text-cyan-800"
          href="/admin/akquise"
        >
          ← Zur Pipeline
        </Link>
        <StatusBadge
          tone={
            lead.status === "won"
              ? "success"
              : lead.status === "lost"
                ? "danger"
                : "info"
          }
        >
          {salesStageLabels[lead.status as LeadStatus]}
        </StatusBadge>
        <span className="font-mono text-xs text-slate-400">Lead {lead.id}</span>
      </div>
      <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <Card>
          <p className="text-xs font-bold tracking-[.16em] text-cyan-700 uppercase">
            Stammdaten
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Kundenakte</h2>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Ansprechperson</dt>
              <dd className="mt-1 font-semibold">
                {lead.contactName || "Noch offen"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">E-Mail</dt>
              <dd className="mt-1 font-semibold">
                {lead.email || "Noch offen"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Telefon</dt>
              <dd className="mt-1 font-semibold">
                {lead.phone || "Noch offen"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Website</dt>
              <dd className="mt-1 truncate font-semibold">
                {lead.website || "Noch offen"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Postanschrift</dt>
              <dd className="mt-1 font-semibold">
                {lead.street && lead.postalCode && lead.city
                  ? `${lead.street}, ${lead.postalCode} ${lead.city}, ${lead.country}`
                  : "Noch unvollständig"}
              </dd>
            </div>
          </dl>
          <div className="mt-5 grid gap-3 rounded-2xl bg-slate-950 p-4 text-white sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-400">QR-Aufrufe</p>
              <p className="mt-1 text-2xl font-semibold">
                {lead.postalLandingViewCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Erster Aufruf</p>
              <p className="mt-1 text-sm font-semibold">
                {lead.postalLandingFirstViewedAt
                  ? formatter.format(lead.postalLandingFirstViewedAt)
                  : "Noch keiner"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Reaktion</p>
              <p className="mt-1 text-sm font-semibold">
                {lead.postalResponse || "Noch keine"}
              </p>
            </div>
          </div>
          <LeadControls
            lead={{
              id: lead.id,
              companyName: lead.companyName,
              contactName: lead.contactName,
              email: lead.email,
              phone: lead.phone,
              website: lead.website,
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
          {lead.convertedTenantId ? (
            <Link
              className="mt-5 inline-flex rounded-xl bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-950"
              href={`/admin/mandanten/${lead.convertedTenantId}`}
            >
              Technische Instanz öffnen →
            </Link>
          ) : null}
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[.16em] text-cyan-700 uppercase">
                Historie
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Alle Vorgänge</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
              {lead.activities.length}
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {lead.activities.length ? (
              lead.activities.map((activity) => (
                <article
                  className="border-l-2 border-cyan-300 pl-4"
                  key={activity.id}
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-semibold">
                      {activityLabels[activity.activityType] ??
                        activity.activityType}
                    </p>
                    <time className="text-xs text-slate-500">
                      {formatter.format(activity.createdAt)}
                    </time>
                  </div>
                  {activity.note ? (
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {activity.note}
                    </p>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                Noch keine Aktivität erfasst.
              </p>
            )}
          </div>
        </Card>
      </section>
      <section className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Card>
          <p className="text-xs font-bold tracking-[.16em] text-cyan-700 uppercase">
            Angebotsbearbeiter
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Neues Angebot</h2>
          <OfferEditor
            leadId={lead.id}
            presets={plans
              .filter((plan) => plan.active)
              .map((plan) => ({
                name: plan.publicName,
                monthlyPrice:
                  plan.monthlyPriceCents === null
                    ? ""
                    : (plan.monthlyPriceCents / 100)
                        .toFixed(2)
                        .replace(".", ","),
                setupPrice:
                  plan.setupPriceCents === null
                    ? ""
                    : (plan.setupPriceCents / 100).toFixed(2).replace(".", ","),
              }))}
          />
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[.16em] text-cyan-700 uppercase">
                Dokumente
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Angebote</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
              {offers.length}
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {offers.length ? (
              offers.map((offer) => (
                <article
                  className="rounded-2xl border border-slate-200 p-4"
                  key={offer.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{offer.offerNumber}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {offer.title} ·{" "}
                        {money.format(offer.netTotalCents / 100)} netto
                      </p>
                    </div>
                    <StatusBadge
                      tone={
                        offer.status === "accepted"
                          ? "success"
                          : offer.status === "declined" ||
                              offer.status === "expired"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {offer.status}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"
                      href={`/api/admin/akquise/angebote/${offer.id}`}
                    >
                      PDF öffnen
                    </a>
                    {offer.status === "draft" ? (
                      <form action={updateSalesOfferStatusAction}>
                        <input name="leadId" type="hidden" value={lead.id} />
                        <input name="offerId" type="hidden" value={offer.id} />
                        <input name="status" type="hidden" value="sent" />
                        <button className="rounded-lg bg-cyan-100 px-3 py-2 text-xs font-semibold text-cyan-950">
                          Als versendet markieren
                        </button>
                      </form>
                    ) : null}
                    {offer.status === "sent" ? (
                      <>
                        <form action={updateSalesOfferStatusAction}>
                          <input name="leadId" type="hidden" value={lead.id} />
                          <input
                            name="offerId"
                            type="hidden"
                            value={offer.id}
                          />
                          <input name="status" type="hidden" value="accepted" />
                          <button className="rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-900">
                            Angenommen
                          </button>
                        </form>
                        <form action={updateSalesOfferStatusAction}>
                          <input name="leadId" type="hidden" value={lead.id} />
                          <input
                            name="offerId"
                            type="hidden"
                            value={offer.id}
                          />
                          <input name="status" type="hidden" value="declined" />
                          <button className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-800">
                            Abgelehnt
                          </button>
                        </form>
                      </>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                Noch kein Angebot erstellt.
              </p>
            )}
          </div>
        </Card>
      </section>
      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[.16em] text-cyan-700 uppercase">
              Postalische Akquise
            </p>
            <h2 className="mt-2 text-2xl font-semibold">OnlineBrief24</h2>
            <p className="mt-2 text-sm text-slate-600">
              {dispatches.length} Briefvorgänge · Zugang{" "}
              {ob24.configured ? "konfiguriert" : "nicht vollständig"} ·{" "}
              {ob24.mode === "test" ? "Testmodus" : "Livemodus"}
            </p>
          </div>
          <Link className="premium-button" href="/admin/akquise/briefe">
            Brief erstellen oder versenden →
          </Link>
        </div>
      </Card>
      <LeadDeletePanel
        blocked={Boolean(lead.convertedTenantId)}
        companyName={lead.companyName}
        id={lead.id}
      />
    </CustomerPage>
  );
}
