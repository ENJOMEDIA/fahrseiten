import { CustomerPage } from "@/components/customer/customer-page";
import { featureCatalog, type FeatureKey } from "@/modules/features/catalog";
import { requirePlatformPermission } from "@/modules/platform/access";
import {
  listPlatformPlans,
  listSellableAddons,
} from "@/modules/platform/plans";

import { AddonForm, PlanForm } from "./pricing-forms";

export default async function PricingAdminPage() {
  await requirePlatformPermission("platform.security.manage");
  const [plans, storedFeatures] = await Promise.all([
    listPlatformPlans(),
    listSellableAddons(),
  ]);
  const features = Object.entries(featureCatalog).map(([key, value]) => ({
    key: key as FeatureKey,
    ...value,
  }));
  const storedByKey = new Map(
    storedFeatures.map((feature) => [feature.key, feature]),
  );

  return (
    <CustomerPage
      title="Pakete & Preise"
      description="Bis zu drei klar verständliche Pakete, enthaltene Leistungen und optionale Module zentral verwalten."
    >
      <div className="mb-7 rounded-[2rem] bg-slate-950 p-6 text-white">
        <p className="text-xs font-semibold tracking-[.16em] text-cyan-300 uppercase">
          Verkaufslogik
        </p>
        <h2 className="mt-2 text-2xl font-semibold">
          {plans.length} von 3 Paketen eingerichtet
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Nur aktive Pakete erscheinen auf der Preisseite. Enthaltene Module
          werden je Paket markiert; weitere Funktionen können mit einem
          transparenten monatlichen Aufpreis angeboten werden.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {plans.map((plan) => (
          <PlanForm features={features} key={plan.id} plan={plan} />
        ))}
        {plans.length < 3 ? <PlanForm features={features} /> : null}
      </div>
      <section className="mt-10 rounded-[2rem] bg-slate-950 p-6 text-white sm:p-8">
        <p className="text-xs font-semibold tracking-[.16em] text-cyan-300 uppercase">
          ENJO MEDIA Zusatzleistung
        </p>
        <h2 className="mt-2 text-2xl font-semibold">
          Foto- & Medienproduktion
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          Fahrzeug-, Team- und Standortfotografie wird auf der Preisseite beim
          umfangreichsten Paket hervorgehoben. Sie ist keine versteckte
          Monatsleistung und wird je nach Einsatz, Entfernung und Bildumfang
          separat angeboten.
        </p>
      </section>
      <section className="mt-10">
        <p className="section-kicker">Optionale Module</p>
        <h2 className="mt-2 text-2xl font-semibold">
          Aufpreise zentral festlegen
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Aktiviere nur Module, die bereits angeboten werden sollen. Geplante
          Funktionen bleiben sichtbar vorbereitet, werden aber nicht automatisch
          verkauft oder freigeschaltet.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const stored = storedByKey.get(feature.key);
            return (
              <AddonForm
                feature={{
                  ...feature,
                  addonAvailable: stored?.addonAvailable ?? false,
                  addonPriceCents: stored?.addonPriceCents ?? null,
                }}
                key={feature.key}
              />
            );
          })}
        </div>
      </section>
    </CustomerPage>
  );
}
