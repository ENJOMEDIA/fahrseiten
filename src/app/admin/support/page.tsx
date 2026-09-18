import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
import { getOperationalSummary } from "@/modules/observability/operations";
import { listRecentErrorReports } from "@/modules/support/error-report-repositories";
export default async function SupportPage() {
  await requirePlatformPermission("platform.support.diagnose");
  const [summary, reports] = await Promise.all([
    getOperationalSummary(),
    listRecentErrorReports(),
  ]);
  return (
    <CustomerPage
      title="Support-Diagnose"
      description="Lesender, protokollierter Einblick in technische Zustände. Es gibt keine verdeckte Kontoübernahme."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Neue Fehlerberichte</p>
          <p className="mt-2 text-3xl font-semibold">
            {summary.newErrorReports}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Fehlgeschlagene Jobs</p>
          <p className="mt-2 text-3xl font-semibold">{summary.failedJobs}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Offene technische Ereignisse</p>
          <p className="mt-2 text-3xl font-semibold">
            {summary.unresolvedTechnicalEvents}
          </p>
        </Card>
      </div>
      <Card className="mb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[.16em] text-cyan-700 uppercase">
              Direkt aus der Plattform
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Letzte Fehlerberichte
            </h2>
          </div>
          <StatusBadge tone={reports.length ? "warning" : "success"}>
            {reports.length} angezeigt
          </StatusBadge>
        </div>
        <div className="mt-5 grid gap-3">
          {reports.length ? (
            reports.map((report) => (
              <article
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                key={report.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{report.summary}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    {report.referenceId}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-slate-600">
                  {report.description}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  {report.tenantName ?? "Öffentliche FahrSeiten-Seite"} ·{" "}
                  {report.surface} · {report.createdAt.toLocaleString("de-DE")}
                </p>
              </article>
            ))
          ) : (
            <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              Aktuell liegen keine Fehlerberichte vor.
            </p>
          )}
        </div>
      </Card>
      <Card>
        <div className="flex justify-between gap-3">
          <h2 className="font-semibold">Diagnosesitzung</h2>
          <StatusBadge tone="warning">Noch nicht gestartet</StatusBadge>
        </div>
        <label className="mt-4 block text-sm font-semibold">
          Mandant oder Referenz-ID
          <input className="mt-2 w-full rounded-xl border p-3" />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Supportgrund
          <textarea className="mt-2 min-h-24 w-full rounded-xl border p-3" />
        </label>
        <button className="mt-4 rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white">
          Protokollierte Leseansicht öffnen
        </button>
        <p className="mt-3 text-xs text-slate-500">
          Tarife, Eigentümerrollen und Sicherheitseinstellungen können hier
          nicht geändert werden.
        </p>
      </Card>
    </CustomerPage>
  );
}
