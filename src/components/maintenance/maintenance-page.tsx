import Link from "next/link";
import Image from "next/image";

import { dashboardUrl } from "@/config/dashboard-url";

export function MaintenancePage({
  brandName,
  message,
  primaryColor,
  accentColor,
  variant,
  logoUrl,
  demoHref,
  showBrandName = true,
}: {
  brandName: string;
  message: string;
  primaryColor: string;
  accentColor: string;
  variant: "platform" | "tenant";
  logoUrl?: string;
  demoHref?: string;
  showBrandName?: boolean;
}) {
  const platform = variant === "platform";
  const previews = platform
    ? [
        ["Websites", "Individuelle Auftritte auf der eigenen Domain."],
        [
          "Einfach pflegen",
          "Inhalte, Anfragen und Website an einem Ort verwalten.",
        ],
        ["Für Fahrschulen", "Von Führerscheinklassen bis zum Fuhrpark."],
      ]
    : [
        ["Ausbildung", "Führerscheinklassen und Angebote auf einen Blick."],
        ["Fahrschule", "Team, Fahrzeuge und Standorte kennenlernen."],
        ["Kontakt", "Ein direkter Weg für Fragen und Anmeldungen."],
      ];
  const highlights = platform
    ? ["Eigene Domain", "Einfacher Editor", "Anfragen im Blick"]
    : ["Moderner Auftritt", "Mobil optimiert", "Direkter Kontakt"];

  return (
    <main
      className="maintenance-stage relative min-h-screen overflow-hidden px-6 py-8 text-white sm:py-12"
      style={{
        background: `radial-gradient(circle at 78% 8%, ${primaryColor}66, transparent 34%), radial-gradient(circle at 15% 82%, ${primaryColor}24, transparent 31%), ${accentColor}`,
      }}
    >
      <meta content="noindex, nofollow" name="robots" />
      <div className="maintenance-grid" aria-hidden="true" />
      <div className="maintenance-aurora" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <p className="flex items-center gap-3 text-sm font-semibold tracking-[0.16em] uppercase">
            {logoUrl ? (
              <span className="grid min-h-10 min-w-12 place-items-center rounded-xl bg-white px-2 shadow-lg">
                <Image
                  alt={`Logo ${brandName}`}
                  className="h-7 w-auto object-contain"
                  height={28}
                  src={logoUrl}
                  unoptimized
                  width={120}
                />
              </span>
            ) : (
              <span
                className="grid size-9 place-items-center rounded-xl text-base tracking-normal shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                F
              </span>
            )}
            {showBrandName ? brandName : null}
          </p>
          <span className="hidden items-center gap-2 text-sm text-white/60 sm:flex">
            <span className="status-pulse size-2 rounded-full bg-cyan-300" />
            Wir bauen gerade
          </span>
        </div>
        <div className="grid items-center gap-14 pt-16 pb-4 lg:grid-cols-[1.05fr_.95fr] lg:pt-24">
          <div className="max-w-4xl">
            <p className="reveal-up inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <span className="mr-2 text-cyan-300">●</span>
              {platform ? "FahrSeiten startet bald" : "Unsere neue Website"}
            </p>
            <h1 className="reveal-up animation-delay-1 mt-7 text-5xl leading-[0.94] font-semibold tracking-[-0.06em] text-balance sm:text-7xl xl:text-[5.6rem]">
              {platform
                ? "Die digitale Poleposition für Fahrschulen."
                : "Hier beginnt dein Weg zum Führerschein."}
            </h1>
            <p className="reveal-up animation-delay-2 mt-7 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
              {message}
            </p>
            <div className="reveal-up animation-delay-3 mt-9 flex flex-wrap gap-3">
              {highlights.map((highlight) => (
                <span
                  className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/75"
                  key={highlight}
                >
                  <span style={{ color: primaryColor }}>✓</span> {highlight}
                </span>
              ))}
            </div>
          </div>

          <div className="maintenance-device reveal-up animation-delay-2 relative mx-auto w-full max-w-xl">
            <div
              className="absolute -inset-8 rounded-full opacity-30 blur-3xl"
              style={{ backgroundColor: primaryColor }}
            />
            <div className="relative rotate-[2deg] overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/85 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="size-2 rounded-full bg-rose-400" />
                <span className="size-2 rounded-full bg-amber-300" />
                <span className="size-2 rounded-full bg-emerald-400" />
                <span className="ml-3 h-5 flex-1 rounded-full bg-white/5" />
              </div>
              <div className="overflow-hidden rounded-[1.35rem] bg-white text-slate-950">
                <span className="maintenance-scan" aria-hidden="true" />
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <strong className="flex items-center gap-2 text-sm">
                    {logoUrl ? (
                      <Image
                        alt=""
                        className="h-5 w-auto object-contain"
                        height={20}
                        src={logoUrl}
                        unoptimized
                        width={80}
                      />
                    ) : null}
                    {showBrandName ? brandName : null}
                  </strong>
                  <div className="flex gap-3 text-[10px] text-slate-400">
                    <span>ANGEBOTE</span>
                    <span>TEAM</span>
                    <span>KONTAKT</span>
                  </div>
                </div>
                <div
                  className="relative overflow-hidden px-6 py-12 text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  <div
                    className="absolute -top-12 -right-12 size-48 rounded-full opacity-30 blur-3xl"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <p
                    className="relative text-[10px] font-bold tracking-[.2em] uppercase"
                    style={{ color: primaryColor }}
                  >
                    {platform
                      ? "Eine Plattform. Viele Möglichkeiten."
                      : "Sicher ans Ziel."}
                  </p>
                  <p className="relative mt-3 max-w-sm text-3xl leading-tight font-semibold tracking-tight">
                    {platform
                      ? "Websites, die Fahrschulen weiterbringen."
                      : "Dein Führerschein beginnt hier."}
                  </p>
                  <div
                    className="relative mt-6 h-8 w-28 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 p-3">
                  {previews.map(([title], index) => (
                    <div
                      className="maintenance-preview-card rounded-xl bg-slate-100 p-3"
                      key={title}
                      style={{ animationDelay: `${index * 180}ms` }}
                    >
                      <div
                        className="mb-7 size-6 rounded-lg opacity-25"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <p className="text-[11px] font-semibold">{title}</p>
                      <div className="mt-2 h-1.5 w-3/4 rounded bg-slate-200" />
                      <div className="mt-1 h-1.5 w-1/2 rounded bg-slate-200" />
                      <span className="sr-only">Bereich {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -right-3 -bottom-5 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 shadow-xl backdrop-blur-xl sm:right-4">
              <p className="text-xs text-white/55">Status</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <span className="status-pulse size-2 rounded-full bg-emerald-300" />
                Inhalte werden vorbereitet
              </p>
            </div>
          </div>
        </div>
        <section
          aria-label="Leistungsüberblick"
          className="mt-20 grid gap-4 border-t border-white/10 pt-10 md:grid-cols-3"
        >
          {previews.map(([title, text], index) => (
            <article
              className="maintenance-card rounded-[2rem] border border-white/12 bg-white/[0.07] p-6 backdrop-blur-md"
              key={title}
            >
              <p className="font-mono text-xs font-semibold tracking-widest text-cyan-300/80">
                0{index + 1}
              </p>
              <h2 className="mt-5 text-xl font-semibold">{title}</h2>
              <p className="mt-3 leading-7 text-white/70">{text}</p>
            </article>
          ))}
        </section>
        <footer className="mt-16 flex flex-col gap-5 border-t border-white/10 pt-8 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brandName}
          </p>
          <nav
            aria-label="Rechtliches"
            className="flex flex-wrap gap-5 text-white/70"
          >
            <Link className="hover:text-white" href="/impressum">
              Impressum
            </Link>
            <Link className="hover:text-white" href="/datenschutz">
              Datenschutz
            </Link>
            <Link className="hover:text-white" href="/cookie-einstellungen">
              Cookie-Einstellungen
            </Link>
            {platform ? (
              <>
                {demoHref ? (
                  <Link
                    className="rounded-full bg-white px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-50"
                    href={demoHref}
                  >
                    Beispiel-Website ansehen
                  </Link>
                ) : null}
                <Link
                  className="rounded-full border border-white/15 px-4 py-2 font-semibold text-white hover:bg-white/10"
                  href={dashboardUrl()}
                >
                  Kundenlogin
                </Link>
              </>
            ) : null}
          </nav>
          <p className="text-xs text-white/40">
            Mit Autonomie und Liebe zum Detail gebaut.
          </p>
        </footer>
      </div>
    </main>
  );
}
