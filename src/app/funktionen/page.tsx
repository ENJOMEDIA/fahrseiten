import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import {
  availableMarketingFeatures,
  plannedMarketingFeatures,
} from "@/config/marketing";
export default function FeaturesPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Funktionen"
      title="Alles für eine überzeugende Fahrschulwebsite."
      text="Strukturierte Inhalte, ein kontrollierter Builder und klare Kundenabläufe – mit ehrlich gekennzeichnetem Produktstand."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {[
          ["01", "Website", "Ein moderner Auftritt auf deiner eigenen Domain."],
          [
            "02",
            "Verwaltung",
            "Inhalte pflegen, ohne Technik verstehen zu müssen.",
          ],
          [
            "03",
            "Anfragen",
            "Interessenten übersichtlich empfangen und bearbeiten.",
          ],
        ].map(([number, title, description]) => (
          <article
            className="feature-card reveal-up rounded-[2rem] bg-slate-950 p-7 text-white"
            key={number}
          >
            <p className="font-mono text-xs text-cyan-300">{number}</p>
            <h2 className="mt-16 text-2xl font-semibold">{title}</h2>
            <p className="mt-3 leading-7 text-slate-400">{description}</p>
          </article>
        ))}
      </div>
      <div className="mt-16 grid gap-10 md:grid-cols-2">
        <section className="rounded-[2rem] border border-cyan-100 bg-cyan-50 p-7 sm:p-9">
          <p className="section-kicker">Direkt nutzbar</p>
          <h2 className="mt-3 text-3xl font-semibold">Im MVP verfügbar</h2>
          <ul className="mt-7 space-y-3">
            {availableMarketingFeatures.map((item) => (
              <li className="flex gap-3 rounded-2xl bg-white p-4" key={item}>
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-cyan-100 text-sm text-cyan-800">
                  ✓
                </span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-slate-50 p-7 sm:p-9">
          <p className="section-kicker text-slate-500">Nächste Ausbaustufen</p>
          <h2 className="mt-3 text-3xl font-semibold">
            Klar als Planung markiert
          </h2>
          <ul className="mt-7 space-y-3">
            {plannedMarketingFeatures.map((item) => (
              <li
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-slate-600"
                key={item}
              >
                <span>{item}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                  geplant
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SimpleMarketingPage>
  );
}
