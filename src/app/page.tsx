import Link from "next/link";

import { MaintenancePage } from "@/components/maintenance/maintenance-page";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { env } from "@/config/env";
import {
  availableMarketingFeatures,
  plannedMarketingFeatures,
} from "@/config/marketing";
import { findPlatformSettings } from "@/modules/setup/platform-settings";
import { mediaPublicUrl } from "@/modules/media/public-url";

export const dynamic = "force-dynamic";

const productAreas = [
  {
    number: "01",
    title: "Deine Website",
    text: "Eine hochwertige Präsenz auf deiner eigenen Domain – mobil optimiert, schnell und klar auf neue Fahrschüler ausgerichtet.",
    tone: "bg-cyan-50 text-cyan-950",
  },
  {
    number: "02",
    title: "Deine Inhalte",
    text: "Führerscheinklassen, Preise, Kurse, Team, Fahrzeuge und Standorte pflegst du ohne technisches Vorwissen.",
    tone: "bg-slate-950 text-white",
  },
  {
    number: "03",
    title: "Deine Anfragen",
    text: "Kontaktanfragen landen übersichtlich im Kundenbereich und bleiben der richtigen Fahrschule zugeordnet.",
    tone: "bg-indigo-50 text-indigo-950",
  },
] as const;

function ProductStage() {
  return (
    <div className="product-stage reveal-up relative mx-auto mt-16 max-w-6xl">
      <div className="absolute -inset-8 -z-10 rounded-[4rem] bg-cyan-400/15 blur-3xl" />
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 shadow-2xl shadow-cyan-950/40 backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex gap-2" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-rose-400/80" />
            <span className="size-2.5 rounded-full bg-amber-300/80" />
            <span className="size-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="text-xs font-medium text-slate-500">
            app.fahrseiten.de
          </span>
          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
            Website online
          </span>
        </div>
        <div className="grid min-h-[31rem] md:grid-cols-[13rem_1fr]">
          <aside className="hidden border-r border-white/10 bg-black/15 p-5 md:block">
            <p className="text-sm font-semibold text-white">FahrSeiten</p>
            <div className="mt-8 space-y-2 text-sm text-slate-500">
              {["Übersicht", "Website", "Inhalte", "Anfragen", "Medien"].map(
                (item, index) => (
                  <div
                    className={`rounded-xl px-3 py-2.5 ${index === 1 ? "bg-white/10 text-white" : ""}`}
                    key={item}
                  >
                    {item}
                  </div>
                ),
              )}
            </div>
          </aside>
          <div className="bg-[#eef2f4] p-4 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-widest text-cyan-700 uppercase">
                  Website bearbeiten
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-950">
                  Startseite
                </p>
              </div>
              <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">
                Veröffentlichen
              </span>
            </div>
            <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
              <div className="flex items-center justify-between border-b px-5 py-3">
                <strong className="text-sm">Fahrschule Nordlicht</strong>
                <div className="hidden gap-4 text-[11px] text-slate-500 sm:flex">
                  <span>Klassen</span>
                  <span>Preise</span>
                  <span>Kontakt</span>
                </div>
              </div>
              <div className="relative overflow-hidden bg-[#101927] px-6 py-12 text-white sm:px-10 sm:py-16">
                <div className="absolute top-0 right-0 size-64 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="relative max-w-md">
                  <span className="text-[10px] font-semibold tracking-[.2em] text-cyan-300 uppercase">
                    Sicher ans Ziel
                  </span>
                  <h2 className="mt-3 text-3xl leading-tight font-semibold sm:text-5xl">
                    Dein Führerschein beginnt hier.
                  </h2>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
                    Persönliche Ausbildung, moderne Fahrzeuge und ein Team, das
                    dich wirklich weiterbringt.
                  </p>
                  <span className="mt-6 inline-flex rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950">
                    Beratung anfragen
                  </span>
                </div>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-3">
                {["Klasse B", "Intensivkurse", "Dein Team"].map((item) => (
                  <div className="rounded-2xl bg-slate-100 p-4" key={item}>
                    <div className="mb-8 size-7 rounded-lg bg-cyan-500/20" />
                    <p className="text-sm font-semibold text-slate-900">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function MarketingStartPage() {
  const settings = await findPlatformSettings();
  if (
    settings?.maintenanceMode ||
    (env.DEMO_DATA_MODE === "database" && !settings)
  ) {
    return (
      <MaintenancePage
        accentColor={settings?.accentColor ?? "#0f172a"}
        brandName={settings?.brandName ?? "FahrSeiten – by ENJO MEDIA"}
        message={
          settings?.maintenanceMessage ??
          "Hier entsteht die neue FahrSeiten-Plattform für moderne Fahrschulen."
        }
        logoUrl={
          settings?.logoMediaId
            ? mediaPublicUrl(settings.logoMediaId)
            : undefined
        }
        primaryColor={settings?.primaryColor ?? "#0891b2"}
        showBrandName={settings?.showBrandName ?? true}
        variant="platform"
        demoHref={
          settings?.demoAvailableDuringMaintenance ? "/demo" : undefined
        }
      />
    );
  }

  return (
    <MarketingShell
      brandName={settings?.brandName}
      showBrandName={settings?.showBrandName}
      logoUrl={
        settings?.logoMediaId ? mediaPublicUrl(settings.logoMediaId) : undefined
      }
    >
      <main className="overflow-hidden">
        <section className="marketing-home-hero relative bg-[#070b12] px-6 pt-24 pb-20 text-white sm:pt-32 sm:pb-28">
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl text-center">
            <p className="reveal-up text-sm font-semibold tracking-[.24em] text-cyan-300 uppercase">
              FahrSeiten · by ENJO MEDIA
            </p>
            <h1 className="reveal-up animation-delay-1 mx-auto mt-7 max-w-6xl text-5xl leading-[0.94] font-semibold tracking-[-0.06em] text-balance sm:text-7xl lg:text-[6.8rem]">
              Deine Fahrschule.
              <span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                Digital auf der Überholspur.
              </span>
            </h1>
            <p className="reveal-up animation-delay-2 mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              FahrSeiten verbindet eine starke Website mit einem Kundenbereich,
              den du wirklich verstehst. Inhalte pflegen, Anfragen beantworten
              und deine Fahrschule präsentieren – alles an einem Ort.
            </p>
            <div className="reveal-up animation-delay-3 mt-10 flex flex-wrap justify-center gap-3">
              <Link className="premium-button" href="/kontakt">
                Kostenlose Erstberatung
                <span aria-hidden="true">→</span>
              </Link>
              <Link className="premium-button-secondary" href="/design">
                FahrSeiten entdecken
              </Link>
            </div>
            <ProductStage />
            <div className="mx-auto mt-12 grid max-w-4xl gap-6 border-t border-white/10 pt-8 text-left sm:grid-cols-3">
              {[
                ["Eine Plattform", "für Website und Verwaltung"],
                ["Deine Domain", "mit deinem eigenen Auftritt"],
                ["Klare Kontrolle", "über Inhalte und Anfragen"],
              ].map(([title, text]) => (
                <div key={title}>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-4xl">
              <p className="section-kicker">Gemacht für den Fahrschulalltag</p>
              <h2 className="section-title mt-5">
                Deine Website soll für dich arbeiten. Nicht umgekehrt.
              </h2>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
                Keine WordPress-Updates, kein unübersichtlicher Baukasten und
                keine getrennte Software pro Standort. FahrSeiten bringt die
                wichtigen Aufgaben in eine ruhige, klare Oberfläche.
              </p>
            </div>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {productAreas.map((area) => (
                <article
                  className={`feature-card min-h-80 rounded-[2rem] p-8 ${area.tone}`}
                  key={area.number}
                >
                  <p className="font-mono text-xs font-semibold tracking-widest opacity-50">
                    {area.number}
                  </p>
                  <div className="mt-24">
                    <h3 className="text-3xl font-semibold tracking-tight">
                      {area.title}
                    </h3>
                    <p className="mt-4 leading-7 opacity-70">{area.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-100 px-6 py-24 sm:py-32">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <p className="section-kicker">Kontrollierter Block-Builder</p>
              <h2 className="section-title mt-5">
                Professionell gestalten. Ohne etwas kaputtzumachen.
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Du kombinierst geprüfte Inhaltsblöcke, passt Texte und Bilder an
                und siehst das Ergebnis vor der Veröffentlichung. Das Design
                bleibt auf jedem Gerät stimmig.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Seiten als Entwurf vorbereiten",
                  "Blöcke sortieren, duplizieren und ausblenden",
                  "Frühere Versionen nachvollziehbar wiederherstellen",
                  "Darstellung für Mobilgerät, Tablet und Desktop prüfen",
                ].map((item) => (
                  <li
                    className="flex items-center gap-3 font-medium"
                    key={item}
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-cyan-100 text-sm text-cyan-800">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="builder-visual rounded-[2.5rem] bg-slate-950 p-4 shadow-2xl shadow-slate-900/20 sm:p-6">
              <div className="rounded-[1.75rem] bg-white p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-cyan-700">
                      SEITENINHALT
                    </p>
                    <p className="mt-1 font-semibold">Startseite</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Gespeichert
                  </span>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    ["Hero", "Willkommen bei deiner Fahrschule"],
                    ["Führerscheinklassen", "Dein Weg zum Führerschein"],
                    ["Vorteile", "Darum lernen Fahrschüler bei uns"],
                    ["Kontakt", "Jetzt unverbindlich anfragen"],
                  ].map(([title, text], index) => (
                    <div
                      className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-4 hover:border-cyan-300 hover:shadow-lg"
                      key={title}
                    >
                      <span className="cursor-grab text-slate-300">⠿</span>
                      <span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-sm font-semibold">
                        0{index + 1}
                      </span>
                      <div>
                        <p className="font-semibold">{title}</p>
                        <p className="text-sm text-slate-500">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[1fr_.8fr] lg:items-end">
              <div>
                <p className="section-kicker">
                  Ein System, alle wichtigen Inhalte
                </p>
                <h2 className="section-title mt-5">
                  Alles, was Interessenten vor der ersten Fahrstunde wissen
                  wollen.
                </h2>
              </div>
              <p className="text-lg leading-8 text-slate-600">
                Informationen werden strukturiert gepflegt und können an den
                passenden Stellen deiner Website ausgespielt werden.
              </p>
            </div>
            <div className="mt-14 flex flex-wrap gap-3">
              {availableMarketingFeatures.map((item, index) => (
                <span
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 font-medium shadow-sm"
                  key={item}
                >
                  <span className="mr-2 text-cyan-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24 sm:pb-32">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-[#0b1220] px-7 py-16 text-white sm:px-14 lg:px-20 lg:py-24">
            <div className="grid gap-14 lg:grid-cols-[1fr_.85fr]">
              <div>
                <p className="section-kicker text-cyan-300">
                  Heute fokussiert. Morgen erweiterbar.
                </p>
                <h2 className="mt-5 text-4xl leading-tight font-semibold tracking-[-0.04em] sm:text-6xl">
                  Ein solides digitales Zuhause für deine Fahrschule.
                </h2>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
                  Der erste Fokus liegt auf Website, Inhalten und Anfragen.
                  Kommende Werkzeuge werden sichtbar angekündigt und erst dann
                  freigeschaltet, wenn sie wirklich einsatzbereit sind.
                </p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 backdrop-blur">
                <p className="text-sm font-semibold text-slate-400">
                  In Planung
                </p>
                <ul className="mt-6 space-y-4">
                  {plannedMarketingFeatures.map((item) => (
                    <li
                      className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 last:border-0"
                      key={item}
                    >
                      <span>{item}</span>
                      <span className="text-cyan-300">↗</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white px-6 py-24 text-center sm:py-32">
          <p className="section-kicker">Bereit für den nächsten Gang?</p>
          <h2 className="mx-auto mt-5 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-[-0.05em] text-balance sm:text-7xl">
            Zeig, was deine Fahrschule besonders macht.
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600">
            Wir schauen gemeinsam, welche Inhalte, Domain und Funktionen zu
            deinem Betrieb passen.
          </p>
          <Link className="premium-button mt-10" href="/kontakt">
            Gespräch starten <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
    </MarketingShell>
  );
}
