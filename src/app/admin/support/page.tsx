import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
import { getOperationalSummary } from "@/modules/observability/operations";
export default async function SupportPage() {
  await requirePlatformPermission("platform.support.diagnose");
  const summary = await getOperationalSummary();
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
