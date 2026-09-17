import Link from "next/link";
import { MarketingHeader } from "@/components/layout/marketing-header";
export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingHeader />
      {children}
      <footer className="border-t border-slate-200 bg-slate-950 px-6 py-12 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="font-semibold text-white">
              FahrSeiten – by ENJO MEDIA
            </p>
            <p className="mt-2 max-w-xl text-sm">
              Mandantenfähige Websites und digitale Werkzeuge für Fahrschulen.
              Aktuell in lokaler Entwicklung.
            </p>
          </div>
          <nav
            aria-label="Footer-Navigation"
            className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm"
          >
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/cookie-einstellungen">Cookie-Einstellungen</Link>
            <Link href="/fehler-melden">Fehler melden</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
export function MarketingHero({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden bg-slate-950 px-6 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold tracking-[.18em] text-cyan-300 uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-5xl text-4xl font-semibold tracking-tight sm:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          {text}
        </p>
        {children}
      </div>
    </section>
  );
}
