import { CustomerPage } from "@/components/customer/customer-page";
import { Card, StatusBadge } from "@/components/ui/card";
import { featureCatalog, type FeatureKey } from "@/modules/features/catalog";
const enabled = new Set<FeatureKey>(["website_builder"]);
export default function CustomerFeaturesPage() {
  return (
    <CustomerPage
      title="Funktionen"
      description="Verfügbare und geplante Funktionen deines lokalen Demo-Tarifs."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(featureCatalog).map(([key, feature]) => {
          const active = enabled.has(key as FeatureKey);
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
