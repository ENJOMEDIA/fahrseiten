import Link from "next/link";
import {
  MarketingHero,
  MarketingShell,
} from "@/components/marketing/marketing-shell";
import {
  availableMarketingFeatures,
  plannedMarketingFeatures,
} from "@/config/marketing";
export default function MarketingStartPage() {
  return (
    <MarketingShell>
      <main>
        <MarketingHero
          eyebrow="FahrSeiten – by ENJO MEDIA"
          title="Die Website-Plattform für Fahrschulen, die klar nach vorn fahren wollen."
          text="FahrSeiten verbindet eine professionelle Fahrschulwebsite mit einem verständlichen Kundenbereich – zentral betrieben, sicher mandantengetrennt und ohne WordPress-Installationen."
        >
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950"
              href="/kontakt"
            >
              Beratung anfragen
            </Link>
            <Link
              className="rounded-full border border-white/30 px-6 py-3 font-semibold"
              href="/demo"
            >
              Fiktive Demo ansehen
            </Link>
          </div>
        </MarketingHero>
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-semibold text-cyan-700">
              Ein System, drei Bereiche
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold sm:text-5xl">
              Vertrieb, Verwaltung und Kundenwebsite aus einer Codebasis.
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                [
                  "fahrseiten.de",
                  "Das Produkt verstehen und Beratung anfragen.",
                ],
                [
                  "app.fahrseiten.de",
                  "Kunden, Inhalte, Domains und Anfragen verwalten.",
                ],
                [
                  "Eigene Domain",
                  "Jede Fahrschule erhält ihre Website aus derselben sicheren Plattform.",
                ],
              ].map(([title, text]) => (
                <article
                  className="rounded-3xl border border-slate-200 bg-white p-7"
                  key={title}
                >
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-cyan-50 px-6 py-20">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-cyan-800">
                Im MVP verfügbar
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                Konzentriert auf den Website-Alltag.
              </h2>
              <ul className="mt-6 space-y-3">
                {availableMarketingFeatures.map((item) => (
                  <li className="flex gap-3" key={item}>
                    <span aria-hidden="true" className="text-cyan-700">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">In Planung</p>
              <h2 className="mt-3 text-3xl font-semibold">
                Erweiterungen mit klarer Kennzeichnung.
              </h2>
              <ul className="mt-6 space-y-3 text-slate-600">
                {plannedMarketingFeatures.map((item) => (
                  <li className="flex gap-3" key={item}>
                    <span aria-hidden="true">○</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <section className="px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold">
            Passt FahrSeiten zu deiner Fahrschule?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Wir besprechen Anforderungen und offenen Produktstand transparent.
            Keine erfundenen Referenzen, keine versteckten Funktionsversprechen.
          </p>
          <Link
            className="mt-7 inline-flex rounded-full bg-slate-950 px-6 py-3 font-semibold text-white"
            href="/kontakt"
          >
            Unverbindlich beraten lassen
          </Link>
        </section>
      </main>
    </MarketingShell>
  );
}
