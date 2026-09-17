import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
export default async function SupportPage() {
  await requirePlatformPermission("platform.support.diagnose");
  return (
    <CustomerPage
      title="Support-Diagnose"
      description="Lesender, protokollierter Einblick in technische Zustände. Es gibt keine verdeckte Kontoübernahme."
    >
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
