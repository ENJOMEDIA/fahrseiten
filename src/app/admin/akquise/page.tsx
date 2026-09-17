import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { requirePlatformPermission } from "@/modules/platform/access";
const stages = [
  "Neu",
  "Kontaktiert",
  "Interessiert",
  "Demo",
  "Angebot",
  "Gewonnen",
  "Verloren",
];
export default async function SalesPage() {
  await requirePlatformPermission("platform.sales.manage");
  return (
    <CustomerPage
      title="Akquise-CRM"
      description="Fiktive Leads, Aktivitäten, Aufgaben und nachvollziehbare Umwandlung in Mandanten."
    >
      <div className="mb-5 flex flex-wrap gap-3">
        <button className="rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white">
          Lead anlegen
        </button>
        <button className="rounded-xl border bg-white px-4 py-3 font-semibold">
          Wiedervorlagen
        </button>
      </div>
      <div className="grid gap-4 xl:grid-cols-7">
        {stages.map((stage, index) => (
          <section className="rounded-2xl bg-slate-200/70 p-3" key={stage}>
            <h2 className="text-sm font-semibold">{stage}</h2>
            {index === 2 ? (
              <Card className="mt-3 p-4">
                <StatusBadge>Fiktiv</StatusBadge>
                <h3 className="mt-2 font-semibold">Fahrschule Sonnenweg</h3>
                <p className="mt-2 text-xs text-slate-600">
                  Nächste Aufgabe: Demo vorbereiten
                </p>
                <button className="mt-3 text-sm font-semibold text-cyan-800">
                  Aktivität erfassen
                </button>
              </Card>
            ) : (
              <p className="mt-3 text-xs text-slate-500">Keine Leads</p>
            )}
          </section>
        ))}
      </div>
    </CustomerPage>
  );
}
