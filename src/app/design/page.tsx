import Link from "next/link";
import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { InteractiveBuilderShowcase } from "@/components/marketing/interactive-builder-showcase";

export default function DesignPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Design & Baukasten"
      title="Deine Marke. In einem System, das einfach bleibt."
      text="Logo, Farben, Bilder und Inhalte werden geführt gepflegt. So bleibt die Website auf Mobilgeräten und großen Bildschirmen zuverlässig stark."
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="maintenance-device relative min-h-[30rem] overflow-hidden rounded-[2.2rem] bg-slate-950 p-6 text-white sm:p-10">
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative rounded-[1.6rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Fahrschule Beispiel</span>
              <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-semibold text-slate-950">
                Anmelden
              </span>
            </div>
            <div className="mt-16 max-w-md">
              <p className="text-sm text-cyan-300">Sicher ans Ziel</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight">
                Dein Führerschein beginnt hier.
              </h2>
              <p className="mt-4 leading-7 text-slate-400">
                Klare Informationen, aktuelle Kurse und eine direkte Anfrage.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-3">
              {["Klassen", "Kurse", "Kontakt"].map((item) => (
                <span
                  className="rounded-xl bg-white/8 p-3 text-center text-xs"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-6">
          {[
            [
              "Logo & Farben",
              "Deine Marke wird zentral hinterlegt und überall einheitlich verwendet.",
            ],
            [
              "Sichere Blöcke",
              "Du wählst Inhaltstypen aus, statt Layouts versehentlich kaputtzumachen.",
            ],
            [
              "Prüfen & Freigeben",
              "Änderungen werden geprüft, bevor sie öffentlich erscheinen.",
            ],
          ].map(([title, text], index) => (
            <article
              className="feature-card rounded-[2rem] border border-slate-200 bg-white p-7"
              key={title}
            >
              <span className="font-mono text-xs text-cyan-700">
                0{index + 1}
              </span>
              <h2 className="mt-5 text-2xl font-semibold">{title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
      <section className="mt-16">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="section-kicker">Website-Builder erleben</p>
          <h2 className="section-title mt-4">
            Seiten aufbauen, während die Vorschau mitdenkt.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Die Darstellung zeigt echte Funktionen des kontrollierten
            FahrSeiten-Builders: Bereiche auswählen, sortieren, ausblenden und
            für unterschiedliche Geräte prüfen.
          </p>
        </div>
        <div className="mx-auto max-w-6xl">
          <InteractiveBuilderShowcase />
        </div>
      </section>
      <div className="mt-10 text-center">
        <Link
          className="inline-flex rounded-full bg-slate-950 px-6 py-3 font-semibold text-white"
          href="/demo"
        >
          Beispiel-Website entdecken →
        </Link>
      </div>
    </SimpleMarketingPage>
  );
}
