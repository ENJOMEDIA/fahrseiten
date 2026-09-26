import Link from "next/link";

import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import {
  getPostalCampaignAnalytics,
  listPostalDispatches,
  onlinebriefConfiguration,
} from "@/modules/onlinebrief/service";
import { listPostalLetterTemplates } from "@/modules/onlinebrief/templates";
import { requirePlatformPermission } from "@/modules/platform/access";
import {
  findPlatformLogoId,
  listPlatformMedia,
} from "@/modules/media/repository";
import { mediaPublicUrl } from "@/modules/media/public-url";
import { listSalesPipeline } from "@/modules/platform/sales-crm";

import {
  ArchivePostalForm,
  DeletePostalForm,
  PreparePostalForm,
  SubmitPostalForm,
  SyncPostalStatusForm,
} from "./postal-forms";
import { SalesNav } from "../sales-nav";

const formatter = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
});

function providerStatusLabel(status: string | null) {
  if (!status) return "noch nicht geprüft";
  return (
    {
      draft: "im Testwarenkorb",
      queue: "in der Warteschlange",
      hold: "angehalten",
      done: "verarbeitet",
      canceled: "storniert",
      nicht_mehr_vorhanden: "beim Anbieter entfernt",
    }[status] ?? status
  );
}

export default async function PostalAcquisitionPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await requirePlatformPermission("platform.sales.manage");
  const [
    query,
    leads,
    allDispatches,
    media,
    templates,
    analytics,
    platformLogoId,
  ] = await Promise.all([
    searchParams,
    listSalesPipeline(),
    listPostalDispatches(),
    listPlatformMedia(),
    listPostalLetterTemplates(),
    getPostalCampaignAnalytics(),
    findPlatformLogoId(),
  ]);
  const showArchived = query.view === "archiv";
  const activeCount = allDispatches.filter((item) => !item.archivedAt).length;
  const archivedCount = allDispatches.length - activeCount;
  const dispatches = allDispatches.filter((item) =>
    showArchived ? Boolean(item.archivedAt) : !item.archivedAt,
  );
  const configuration = onlinebriefConfiguration();
  return (
    <CustomerPage
      title="Briefakquise"
      description="Personalisierte PDF-Briefe mit festem Lead-Link erzeugen und kontrolliert an OnlineBrief24 übertragen."
    >
      <SalesNav />
      <section className="mb-6 overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[.18em] text-cyan-300 uppercase">
              Kampagnenwirkung
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Vom Brief bis zum Kunden
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Jeder QR-Link bleibt mit seiner Kundenakte verbunden. Gezählt
              werden nur Linkaufrufe und Antworten – keine IP-Adressen oder
              Gerätefingerabdrücke.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
            {analytics.liveRecipients} live · {analytics.testRecipients} Test
          </span>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "Übertragene Kontakte",
              analytics.recipients,
              "Basis der Auswertung",
            ],
            [
              "QR geöffnet",
              `${analytics.viewRate} %`,
              `${analytics.viewed} Kontakte`,
            ],
            [
              "Reagiert",
              `${analytics.responseRate} %`,
              `${analytics.responded} Antworten`,
            ],
            ["Gewonnen", `${analytics.winRate} %`, `${analytics.won} Kunden`],
          ].map(([label, value, detail]) => (
            <article
              className="rounded-2xl border border-white/10 bg-white/[.06] p-4"
              key={label}
            >
              <p className="text-xs font-semibold text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
              <p className="mt-1 text-xs text-cyan-200">{detail}</p>
            </article>
          ))}
        </div>
        {analytics.regions.length ? (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-white/[.06] text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-semibold">Bundesland</th>
                  <th className="px-4 py-3 font-semibold">Briefe</th>
                  <th className="px-4 py-3 font-semibold">Aufrufe</th>
                  <th className="px-4 py-3 font-semibold">Antworten</th>
                  <th className="px-4 py-3 font-semibold">Gewonnen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {analytics.regions.map((region) => (
                  <tr key={region.name}>
                    <td className="px-4 py-3 font-semibold text-white">
                      {region.name}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {region.recipients}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {region.viewed}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {region.responded}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{region.won}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <p className="mt-3 text-[11px] leading-5 text-slate-500">
          Das Bundesland wird näherungsweise aus der in der Kundenakte
          gespeicherten deutschen PLZ abgeleitet. Grenzbereiche werden als nicht
          eindeutig ausgewiesen.
        </p>
      </section>
      <div
        className={`mb-6 rounded-2xl border p-4 text-sm ${configuration.configured ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}
      >
        <p className="font-semibold">
          OnlineBrief24:{" "}
          {configuration.configured
            ? "Zugang konfiguriert"
            : "Zugangsdaten fehlen"}{" "}
          · Modus{" "}
          {configuration.mode === "test" ? "Testwarenkorb" : "Liveversand"}
        </p>
        <p className="mt-1 leading-6">
          Im Testmodus wird laut Anbieter nichts unmittelbar produziert. Der
          Auftrag landet zur Prüfung im OnlineBrief24-Warenkorb und wird dort
          nach sieben Tagen automatisch gelöscht.
        </p>
        <p className="mt-1 leading-6">
          Der vorhandene Fünf-Minuten-Scheduler gleicht übertragene Aufträge
          automatisch mit OnlineBrief24 ab. Du kannst den Abgleich zusätzlich
          jederzeit manuell starten.
        </p>
        <p className="mt-2 font-semibold">
          Briefkopf-Logo:{" "}
          {platformLogoId ? "ausgewählt" : "noch nicht festgelegt"}
        </p>
        {configuration.mode === "test" ? (
          <p className="mt-2 rounded-xl border border-amber-300 bg-white/60 p-3 leading-6">
            Für einen echten einzelnen Testbrief in Plesk
            <code className="mx-1 rounded bg-amber-100 px-1.5 py-0.5">
              ONLINEBRIEF_MODE=live
            </code>
            setzen und die Node.js-Anwendung neu starten. Danach ein neues PDF
            erzeugen. Bereits im Testmodus erstellte Vorgänge bleiben sicher im
            Testmodus.
          </p>
        ) : (
          <p className="mt-2 rounded-xl border border-red-300 bg-red-50 p-3 leading-6 font-semibold text-red-900">
            Livemodus ist aktiv. Jede Übertragung kann kostenpflichtig gedruckt
            und postalisch versendet werden. Für den ersten Probelauf genau
            einen Empfänger auswählen und PDF sowie Anschrift vor dem Versand
            prüfen.
          </p>
        )}
      </div>
      <section className="grid gap-6 xl:grid-cols-[.75fr_1.25fr]">
        <Card>
          <p className="text-xs font-bold tracking-[.16em] text-cyan-700 uppercase">
            Schritt 1
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Brief-PDF erzeugen</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Empfängeranschrift, persönliche Lead-ID und QR-Code werden fest in
            das PDF eingebaut. Logo, Text und ein optionales Motiv lassen sich
            direkt vor der Erzeugung zusammenstellen. Prüfe das PDF vor jeder
            Übertragung.
          </p>
          <div className="mt-5">
            <PreparePostalForm
              defaultLogoId={platformLogoId ?? ""}
              leads={leads.map((lead) => ({
                id: lead.id,
                companyName: lead.companyName,
                tags: lead.tags,
                researchNote: lead.researchNote,
                addressComplete: Boolean(
                  lead.street && lead.postalCode && lead.city,
                ),
              }))}
              logos={media
                .filter(
                  (asset) =>
                    asset.mimeType.startsWith("image/") &&
                    asset.category === "branding",
                )
                .map((asset) => ({
                  id: asset.id,
                  label: `${asset.description || asset.originalName} · ${asset.width}×${asset.height}`,
                  url: mediaPublicUrl(asset.id),
                }))}
              media={media
                .filter(
                  (asset) =>
                    asset.mimeType.startsWith("image/") &&
                    asset.category !== "branding" &&
                    asset.width >= 600 &&
                    asset.height >= 200,
                )
                .map((asset) => ({
                  id: asset.id,
                  label: asset.description || asset.originalName,
                }))}
              templates={templates
                .filter((template) => template.active)
                .map((template) => ({
                  id: template.id,
                  name: template.name,
                  kickerTemplate: template.kickerTemplate,
                  headlineTemplate: template.headlineTemplate,
                  bodyTemplate: template.bodyTemplate,
                }))}
            />
          </div>
        </Card>
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[.16em] text-cyan-700 uppercase">
                Schritt 2
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Versandhistorie</h2>
            </div>
            <SyncPostalStatusForm />
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
            <Link
              className={`rounded-full px-4 py-2 text-xs font-semibold ${!showArchived ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
              href="/admin/akquise/briefe"
            >
              Aktiv · {activeCount}
            </Link>
            <Link
              className={`rounded-full px-4 py-2 text-xs font-semibold ${showArchived ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
              href="/admin/akquise/briefe?view=archiv"
            >
              Archiv · {archivedCount}
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {dispatches.length ? (
              dispatches.map((dispatch) => (
                <article
                  className="rounded-2xl border border-slate-200 p-4"
                  key={dispatch.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        className="font-semibold text-cyan-900"
                        href={`/admin/akquise/${dispatch.leadId}`}
                      >
                        {dispatch.companyName}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatter.format(dispatch.createdAt)} ·{" "}
                        {dispatch.mode === "test" ? "Test" : "Live"} · SHA-256{" "}
                        {dispatch.sha256.slice(0, 12)}…
                      </p>
                    </div>
                    <StatusBadge
                      tone={
                        dispatch.status === "submitted"
                          ? "success"
                          : dispatch.status === "failed"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {dispatch.status === "submitted"
                        ? `OnlineBrief24 · ${providerStatusLabel(dispatch.providerStatus)}`
                        : dispatch.status === "failed"
                          ? "Fehlgeschlagen"
                          : "Vorbereitet"}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"
                      href={`/api/admin/akquise/briefe/${dispatch.id}`}
                    >
                      PDF prüfen
                    </a>
                    {dispatch.providerJobId ? (
                      <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold">
                        Auftrag {dispatch.providerJobId}
                      </span>
                    ) : null}
                  </div>
                  {dispatch.errorCode ? (
                    <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-800">
                      {dispatch.errorCode}
                    </p>
                  ) : null}
                  {dispatch.providerJobId ? (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                      <p>
                        Letzter Anbieterabgleich:{" "}
                        {dispatch.providerCheckedAt
                          ? formatter.format(dispatch.providerCheckedAt)
                          : "noch nicht durchgeführt"}
                      </p>
                      <div className="mt-2">
                        <SyncPostalStatusForm dispatchId={dispatch.id} />
                      </div>
                    </div>
                  ) : null}
                  {dispatch.status === "prepared" ? (
                    <SubmitPostalForm
                      companyName={dispatch.companyName}
                      dispatchId={dispatch.id}
                      mode={dispatch.mode}
                      recipientAddress={`${dispatch.street ?? ""}, ${dispatch.postalCode ?? ""} ${dispatch.city ?? ""}`}
                    />
                  ) : null}
                  <DeletePostalForm
                    dispatchId={dispatch.id}
                    submitted={dispatch.status === "submitted"}
                  />
                  <ArchivePostalForm
                    archived={Boolean(dispatch.archivedAt)}
                    dispatchId={dispatch.id}
                  />
                </article>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                Noch kein Brief vorbereitet.
              </p>
            )}
          </div>
        </Card>
      </section>
    </CustomerPage>
  );
}
