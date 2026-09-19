import Link from "next/link";

import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import {
  listPostalDispatches,
  onlinebriefConfiguration,
} from "@/modules/onlinebrief/service";
import { listPostalLetterTemplates } from "@/modules/onlinebrief/templates";
import { requirePlatformPermission } from "@/modules/platform/access";
import { listPlatformMedia } from "@/modules/media/repository";
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
  const [query, leads, allDispatches, media, templates] = await Promise.all([
    searchParams,
    listSalesPipeline(),
    listPostalDispatches(),
    listPlatformMedia(),
    listPostalLetterTemplates(),
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
              leads={leads.map((lead) => ({
                id: lead.id,
                companyName: lead.companyName,
                addressComplete: Boolean(
                  lead.street && lead.postalCode && lead.city,
                ),
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
                      dispatchId={dispatch.id}
                      leadId={dispatch.leadId}
                      mode={dispatch.mode}
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
