import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePlatformPermission("platform.tenants.manage");
  const { id } = await params;
  return (
    <CustomerPage
      title="Mandantendetails"
      description={`Technische Demo-ID: ${id}. Keine echten Kunden- oder Vertragsdaten.`}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Plan & Features</h2>
          <p className="mt-3">Lokaler Demo-Plan</p>
          <p className="mt-2">
            <StatusBadge tone="success">Website-Builder aktiv</StatusBadge>
          </p>
          <p className="mt-2">
            <StatusBadge>Fahrstundenplanung: In Planung</StatusBadge>
          </p>
        </Card>
        <Card>
          <h2 className="font-semibold">Domain</h2>
          <p className="mt-3">demo.fahrseiten.local</p>
          <StatusBadge tone="success">Lokal aktiv</StatusBadge>
        </Card>
        <Card>
          <h2 className="font-semibold">Onboarding</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>✓ Demo-Mandant angelegt</li>
            <li>✓ Lokale Domain zugeordnet</li>
            <li>○ Rechtstexte fachlich prüfen</li>
            <li>○ Produktive Domain freigeben</li>
          </ul>
        </Card>
        <Card>
          <h2 className="font-semibold">Interne Notiz</h2>
          <textarea
            className="mt-3 min-h-24 w-full rounded-xl border p-3"
            placeholder="Keine Zugangsdaten oder sensiblen Inhalte"
          />
          <button className="mt-3 rounded-xl border px-4 py-2 font-semibold">
            Protokolliert speichern
          </button>
        </Card>
        <Card>
          <h2 className="font-semibold">Kundenzugänge</h2>
          <p className="mt-3 text-sm">inhaber@morgenrot.local · tenant_owner</p>
          <button className="mt-3 rounded-xl border px-4 py-2 font-semibold">
            Einladung vorbereiten
          </button>
        </Card>
        <Card>
          <h2 className="font-semibold">Aktivitäten</h2>
          <p className="mt-3 text-sm text-slate-600">
            Lokaler Seed angelegt. Weitere Änderungen erscheinen mit Akteur und
            Zeitstempel.
          </p>
        </Card>
      </div>
    </CustomerPage>
  );
}
