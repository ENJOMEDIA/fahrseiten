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

  return (
    <main
      className="maintenance-stage relative min-h-screen overflow-hidden px-6 py-8 text-white sm:py-12"
      style={{
        background: `radial-gradient(circle at 78% 8%, ${primaryColor}66, transparent 34%), radial-gradient(circle at 15% 82%, ${primaryColor}24, transparent 31%), ${accentColor}`,
      }}
    >
      <meta content="noindex, nofollow" name="robots" />
      <div className="maintenance-grid" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <p className="flex items-center gap-3 text-sm font-semibold tracking-[0.16em] uppercase">
            <span
              className="grid size-9 place-items-center rounded-xl text-base tracking-normal shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              F
            </span>
            {brandName}
          </p>
          <span className="hidden items-center gap-2 text-sm text-white/60 sm:flex">
            <span className="status-pulse size-2 rounded-full bg-cyan-300" />
            Wir bauen gerade
          </span>
        </div>
        <div className="mt-20 max-w-4xl sm:mt-28">
          <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
            <span className="mr-2 text-cyan-300">●</span> Bald für dich da
          </p>
          <h1 className="mt-7 text-5xl leading-[0.96] font-semibold tracking-[-0.05em] text-balance sm:text-8xl">
            Die digitale Poleposition für Fahrschulen.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
            {message}
          </p>
        </div>
        <section
          aria-label="Vorschau"
          className="mt-16 grid gap-4 sm:mt-20 md:grid-cols-3"
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
          </nav>
        </footer>
      </div>
    </main>
  );
}
