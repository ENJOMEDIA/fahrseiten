import Link from "next/link";
import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { marketingPlans } from "@/config/marketing";

export default function PricingPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Preise"
      title="Ein digitales Zuhause, das mit deiner Fahrschule wächst."
      text="Wir starten mit einer klaren Website-Basis und besprechen den passenden Umfang persönlich. Preise werden transparent angeboten, sobald das Leistungsmodell final feststeht."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {marketingPlans.map((plan, index) => (
          <article
            className={`feature-card reveal-up rounded-[2rem] p-8 sm:p-10 ${plan.available ? "bg-slate-950 text-white" : "border border-slate-200 bg-slate-50"}`}
            key={plan.key}
          >
            <div className="flex items-center justify-between gap-3">
              <p
                className={`text-xs font-semibold tracking-[.16em] uppercase ${plan.available ? "text-cyan-300" : "text-slate-500"}`}
              >
                {plan.available ? "Zum Start" : "Später erweiterbar"}
              </p>
              <span className="font-mono text-xs opacity-50">0{index + 1}</span>
            </div>
            <h2 className="mt-8 text-3xl font-semibold tracking-tight">
              {plan.name}
            </h2>
            <p
              className={`mt-4 max-w-xl leading-7 ${plan.available ? "text-slate-300" : "text-slate-600"}`}
            >
              {plan.description}
            </p>
            <p className="mt-10 text-2xl font-semibold">
              {plan.price ?? "Individuelles Angebot"}
            </p>
            {plan.available ? (
              <Link className="premium-button mt-7" href="/kontakt">
                Unverbindlich sprechen <span aria-hidden>→</span>
              </Link>
            ) : (
              <p className="mt-7 text-sm text-slate-500">
                Wird erst nach dem MVP freigeschaltet.
              </p>
            )}
          </article>
        ))}
      </div>
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
