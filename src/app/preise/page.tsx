import Link from "next/link";
import { connection } from "next/server";
import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { featureCatalog, type FeatureKey } from "@/modules/features/catalog";
import {
  listPlatformPlans,
  listSellableAddons,
} from "@/modules/platform/plans";
import { formatEuro } from "@/modules/platform/pricing";

export default async function PricingPage() {
  await connection();
  const [allPlans, addons] = await Promise.all([
    listPlatformPlans().catch(() => []),
    listSellableAddons().catch(() => []),
  ]);
  const marketingPlans = allPlans.filter((plan) => plan.active).slice(0, 3);
  const sellableAddons = addons.filter((addon) => addon.addonAvailable);
  return (
    <SimpleMarketingPage
      eyebrow="Preise"
      title="Ein digitales Zuhause, das mit deiner Fahrschule wächst."
      text="Wähle den Umfang, der heute zu deiner Fahrschule passt. Enthaltene Leistungen und optionale Module bleiben klar nachvollziehbar."
    >
      {marketingPlans.length === 0 ? (
        <div className="rounded-[2rem] border border-cyan-100 bg-cyan-50 p-8 sm:p-10">
          <p className="section-kicker">Persönliches Angebot</p>
          <h2 className="mt-3 text-3xl font-semibold">
            Die Pakete werden gerade final kalkuliert.
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Bis zur Veröffentlichung erstellen wir ein nachvollziehbares Angebot
            passend zu deiner Fahrschule.
          </p>
          <Link className="premium-button mt-6" href="/kontakt">
            Umfang besprechen →
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {marketingPlans.map((plan, index) => (
            <article
              className={`feature-card reveal-up rounded-[2rem] p-8 sm:p-10 ${plan.highlighted ? "bg-slate-950 text-white" : "border border-slate-200 bg-white"}`}
              key={plan.key}
            >
              <div className="flex items-center justify-between gap-3">
                <p
                  className={`text-xs font-semibold tracking-[.16em] uppercase ${plan.highlighted ? "text-cyan-300" : "text-slate-500"}`}
                >
                  {plan.highlighted ? "Unsere Empfehlung" : "FahrSeiten Paket"}
                </p>
                <span className="font-mono text-xs opacity-50">
                  0{index + 1}
                </span>
              </div>
              <h2 className="mt-8 text-3xl font-semibold tracking-tight">
                {plan.publicName}
              </h2>
              <p
                className={`mt-4 max-w-xl leading-7 ${plan.highlighted ? "text-slate-300" : "text-slate-600"}`}
              >
                {plan.description}
              </p>
              <p className="mt-8 text-3xl font-semibold">
                {formatEuro(plan.monthlyPriceCents)}
                <span className="ml-1 text-sm font-normal opacity-60">
                  / Monat
                </span>
              </p>
              {plan.setupPriceCents !== null ? (
                <p className="mt-1 text-sm opacity-60">
                  zzgl. {formatEuro(plan.setupPriceCents)} Einrichtung
                </p>
              ) : null}
              <ul className="mt-7 space-y-2 text-sm">
                {plan.includedFeatures.map((key) => (
                  <li key={key}>
                    ✓ {featureCatalog[key as FeatureKey]?.title ?? key}
                  </li>
                ))}
              </ul>
              <Link
                className={
                  plan.highlighted
                    ? "premium-button mt-7"
                    : "mt-7 inline-flex rounded-full bg-slate-950 px-5 py-3 font-semibold text-white"
                }
                href="/kontakt"
              >
                Paket anfragen <span aria-hidden>→</span>
              </Link>
            </article>
          ))}
        </div>
      )}
      {sellableAddons.length > 0 ? (
        <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-8 sm:p-10">
          <p className="section-kicker">Flexibel ergänzen</p>
          <h2 className="mt-3 text-3xl font-semibold">Optionale Module</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sellableAddons.map((addon) => (
              <div className="rounded-2xl bg-slate-50 p-4" key={addon.key}>
                <p className="font-semibold">{addon.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {addon.description}
                </p>
                <p className="mt-3 text-sm font-semibold text-cyan-800">
                  + {formatEuro(addon.addonPriceCents)} / Monat
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <section className="mt-16 rounded-[2rem] border border-cyan-100 bg-cyan-50 p-8 sm:p-10">
        <p className="section-kicker">Ohne Überraschungen</p>
        <div className="mt-4 grid gap-8 md:grid-cols-[1fr_1fr]">
          <h2 className="text-3xl font-semibold tracking-tight">
            Du weißt vor dem Start, was eingerichtet wird.
          </h2>
          <ul className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            {[
              "Eigene Domain",
              "Kundenbereich",
              "Pflegbare Inhalte",
              "Wartungsmodus",
              "Rechtliche Grundstruktur",
              "Persönliches Onboarding",
            ].map((item) => (
              <li
                className="rounded-xl bg-white px-4 py-3 font-semibold"
                key={item}
              >
                ✓ {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SimpleMarketingPage>
  );
}
