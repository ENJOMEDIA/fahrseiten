import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { featureCatalog } from "@/modules/features/catalog";
import { getSessionIdentity } from "@/modules/auth/session";
import { getTenantFeatureStatusMap } from "@/modules/features/access";
import { isFeatureUsable } from "@/modules/features/service";
import { redirect } from "next/navigation";

export default async function CustomerFeaturesPage({
  searchParams,
}: {
  searchParams: Promise<{ feature?: string }>;
}) {
  const membership = (await getSessionIdentity())?.memberships[0];
  if (!membership) redirect("/login");
  const [statuses, query] = await Promise.all([
    getTenantFeatureStatusMap(membership.tenantId),
    searchParams,
  ]);
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
          const status = statuses[key as keyof typeof statuses];
          const active = isFeatureUsable(status);
          const planned = feature.availability === "planned";
          const selected = query.feature === key;
          return (
            <Card className={selected ? "ring-2 ring-cyan-500" : ""} key={key}>
              <div className="flex justify-between gap-3">
                <h2 className="font-semibold">{feature.title}</h2>
                <StatusBadge
                  tone={active ? "success" : planned ? "neutral" : "warning"}
                >
                  {active
                    ? "In deinem Paket"
                    : planned
                      ? "In Planung"
                      : "Nicht im Paket"}
                </StatusBadge>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {feature.description}
              </p>
              {active ? (
                <p className="mt-4 text-sm font-semibold text-cyan-800">
                  Im Kundenbereich freigeschaltet
                </p>
              ) : planned ? (
                <p className="mt-4 text-sm text-slate-500">
                  Noch keine aktive Funktion
                </p>
              ) : (
                <p className="mt-4 text-sm font-semibold text-amber-700">
                  Kann über ein größeres Paket oder als Zusatzmodul
                  freigeschaltet werden.
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </CustomerPage>
  );
}
