import Link from "next/link";

export function MaintenancePage({
  brandName,
  message,
  primaryColor,
  accentColor,
  variant,
}: {
  brandName: string;
  message: string;
  primaryColor: string;
  accentColor: string;
  variant: "platform" | "tenant";
}) {
  const previews =
    variant === "platform"
      ? [
          ["Websites", "Individuelle Fahrschulwebsites aus einer Plattform."],
          [
            "Verwaltung",
            "Inhalte, Domains und Anfragen übersichtlich steuern.",
          ],
          ["Weitergedacht", "Ein solides Fundament für kommende Funktionen."],
        ]
      : [
          ["Ausbildung", "Führerscheinklassen und Angebote auf einen Blick."],
          ["Fahrschule", "Team, Fahrzeuge und Standorte kennenlernen."],
          ["Kontakt", "Ein direkter Weg für Fragen und Anmeldungen."],
        ];

  return (
    <main
      className="min-h-screen px-6 py-12 text-white sm:py-20"
      style={{
        background: `radial-gradient(circle at top right, ${primaryColor}55, transparent 38%), ${accentColor}`,
      }}
    >
      <meta content="noindex, nofollow" name="robots" />
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold tracking-[0.2em] uppercase opacity-80">
          {brandName}
        </p>
        <div className="mt-20 max-w-3xl sm:mt-28">
          <p
            className="inline-flex rounded-full px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: primaryColor }}
          >
            Bald verfügbar
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-7xl">
            Hier entsteht etwas Neues.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
            {message}
          </p>
        </div>
        <section
          aria-label="Vorschau"
          className="mt-16 grid gap-4 md:grid-cols-3"
        >
          {previews.map(([title, text], index) => (
            <article
              className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm"
              key={title}
            >
              <p className="text-sm font-semibold text-white/55">
                0{index + 1}
              </p>
              <h2 className="mt-5 text-xl font-semibold">{title}</h2>
              <p className="mt-3 leading-7 text-white/70">{text}</p>
            </article>
          ))}
        </section>
        <p className="mt-16 text-sm text-white/55">
          © {new Date().getFullYear()} {brandName}
        </p>
        <nav
          aria-label="Rechtliches"
          className="mt-4 flex flex-wrap gap-5 text-sm text-white/70"
        >
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <Link href="/cookie-einstellungen">Cookie-Einstellungen</Link>
        </nav>
      </div>
    </main>
  );
}
