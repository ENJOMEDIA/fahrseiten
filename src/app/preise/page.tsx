import Link from "next/link";
import { connection } from "next/server";
import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { featureCatalog, type FeatureKey } from "@/modules/features/catalog";
import {
  listPlatformPlans,
  listSellableAddons,
} from "@/modules/platform/plans";
import { formatEuro } from "@/modules/platform/pricing";
import { calculateBillingSnapshot } from "@/modules/billing/intervals";

const salesFeatureOrder: FeatureKey[] = [
  "managed_website",
  "website_builder",
  "content_modules",
  "custom_domain",
  "theme_templates",
  "media_branding",
  "maintenance_preview",
  "legal_consent",
  "multi_location",
  "priority_support",
];

function bySalesRelevance(left: string, right: string) {
  const leftIndex = salesFeatureOrder.indexOf(left as FeatureKey);
  const rightIndex = salesFeatureOrder.indexOf(right as FeatureKey);
  return (
    (leftIndex < 0 ? 999 : leftIndex) - (rightIndex < 0 ? 999 : rightIndex)
  );
}

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
              {plan.annualBillingEnabled && plan.monthlyPriceCents !== null ? (
                <p className="mt-3 rounded-xl bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-900">
                  Jahreszahlung:{" "}
                  {formatEuro(
                    calculateBillingSnapshot(plan, 12)
                      .billingAmountCentsSnapshot,
                  )}{" "}
                  pro Jahr · {plan.annualDiscountBasisPoints / 100} % Vorteil
                </p>
              ) : null}
              {plan.setupPriceCents !== null ? (
                <p className="mt-1 text-sm opacity-60">
                  zzgl. {formatEuro(plan.setupPriceCents)} Einrichtung
                </p>
              ) : null}
              <p className="mt-3 text-xs leading-5 opacity-70">
                Mindestlaufzeit {plan.minimumTermMonths} Monat(e). Danach
                unbefristet und mit einem Monat Frist zum Monatsende kündbar.
                Zahlungsweise und Vertragslaufzeit sind getrennt.
              </p>
              {index === marketingPlans.length - 1 &&
              marketingPlans.length === 3 ? (
                <div
                  className={`mt-6 rounded-2xl border p-4 ${plan.highlighted ? "border-cyan-300/30 bg-cyan-300/10" : "border-cyan-100 bg-cyan-50"}`}
                >
                  <p
                    className={`text-xs font-bold tracking-[.14em] uppercase ${plan.highlighted ? "text-cyan-300" : "text-cyan-700"}`}
                  >
                    Mit Medienproduktion kombinierbar
                  </p>
                  <p className="mt-2 text-sm leading-6 opacity-75">
                    Neue Fahrzeug-, Team- und Standortfotos von ENJO MEDIA als
                    separat kalkulierte Zusatzleistung.
                  </p>
                </div>
              ) : null}
              <ul className="mt-7 space-y-2 text-sm">
                {[...plan.includedFeatures]
                  .sort(bySalesRelevance)
                  .map((key) => (
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
            {[...sellableAddons]
              .sort((left, right) => bySalesRelevance(left.key, right.key))
              .map((addon) => (
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
      <section className="relative mt-12 overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white sm:p-10">
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-16 size-72 rounded-full bg-cyan-400/20 blur-3xl"
        />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[.18em] text-cyan-300 uppercase">
              ENJO MEDIA Fotografie
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Deine Fahrschule verdient eigene Bilder statt austauschbarer
              Stockfotos.
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-slate-300">
              Auf Wunsch fotografieren wir Fahrzeuge, Team und Standorte und
              bereiten die Auswahl direkt für deine FahrSeiten-Website auf. Die
              Medienverwaltung bleibt Bestandteil des gebuchten Pakets; der
              Fototermin und die Bildproduktion werden einmalig und transparent
              nach Umfang angeboten.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur">
            <ul className="space-y-3 text-sm text-slate-200">
              <li>✓ Fahrzeug- und Detailaufnahmen</li>
              <li>✓ Team- und Standortfotografie</li>
              <li>✓ Auswahl, Bearbeitung und Web-Optimierung</li>
              <li>✓ Direkte Einpflege in den Medienbereich</li>
            </ul>
            <p className="mt-5 text-xs leading-5 text-slate-400">
              Preis nach Umfang, Entfernung und gewünschter Bildmenge.
            </p>
            <Link
              className="mt-5 inline-flex rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950"
              href="/kontakt"
            >
              Medienpaket anfragen →
            </Link>
          </div>
        </div>
      </section>
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
