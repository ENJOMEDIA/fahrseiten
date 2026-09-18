import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { featureCatalog } from "@/modules/features/catalog";
export default function CustomerFeaturesPage() {
  return (
    <CustomerPage
      title="Funktionen"
      description="Bereits verfügbare Plattformfunktionen und transparent gekennzeichnete Erweiterungen."
    >
      <section className="mb-7 overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white">
        <p className="text-xs font-semibold tracking-[.18em] text-cyan-300 uppercase">
          Eine Plattform, die mitwächst
        </p>
        <h2 className="mt-2 text-2xl font-semibold">
          Website heute. Mehr digitale Fahrschule Schritt für Schritt.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          Verfügbare Funktionen kannst du bereits nutzen. Geplante Module wie
          Benutzerverwaltung, Terminplanung, Erinnerungen und Kampagnen sind
          klar gekennzeichnet und werden später in denselben Kundenbereich
          integriert.
        </p>
      </section>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(featureCatalog).map(([key, feature]) => {
          const active = feature.availability === "available";
          return (
            <Card key={key}>
              <div className="flex justify-between gap-3">
                <h2 className="font-semibold">{feature.title}</h2>
                <StatusBadge tone={active ? "success" : "neutral"}>
                  {active ? "Verfügbar" : "In Planung"}
                </StatusBadge>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {feature.description}
              </p>
              {active ? (
                <p className="mt-4 text-sm font-semibold text-cyan-800">
                  Im Kundenbereich nutzbar
                </p>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  Noch keine aktive Funktion
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </CustomerPage>
  );
}
