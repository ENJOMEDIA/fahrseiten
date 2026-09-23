import Link from "next/link";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { dashboardUrl } from "@/config/dashboard-url";
export function MarketingShell({
  children,
  logoUrl,
  brandName,
  showBrandName = true,
}: {
  children: React.ReactNode;
  logoUrl?: string;
  brandName?: string;
  showBrandName?: boolean;
}) {
  return (
    <>
      <MarketingHeader
        brandName={brandName}
        logoUrl={logoUrl}
        showBrandName={showBrandName}
      />
      {children}
      <footer className="border-t border-white/10 bg-[#070b12] px-6 py-14 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_auto]">
          <div>
            {showBrandName ? (
              <p className="text-lg font-semibold tracking-tight text-white">
                {brandName ?? "FahrSeiten"}
                <span className="ml-2 text-xs font-medium tracking-wide text-slate-500">
                  by ENJO MEDIA
                </span>
              </p>
            ) : null}
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Websites, Inhalte und digitale Kundenkontakte für Fahrschulen –
              zentral, verständlich und auf der eigenen Domain.
            </p>
          </div>
          <nav
            aria-label="Footer-Navigation"
            className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm text-slate-400 sm:grid-cols-2"
          >
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/agb">AGB</Link>
            <Link href="/empfehlungsbedingungen">Empfehlungsbedingungen</Link>
            <Link href="/cookie-einstellungen">Cookie-Einstellungen</Link>
            <Link href="/fehler-melden">Fehler melden</Link>
          </nav>
          <div className="md:col-span-2 md:flex md:justify-end">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              href={dashboardUrl()}
            >
              Zum Kundenlogin →
            </Link>
          </div>
          <p className="text-xs text-slate-500 md:col-span-2 md:text-right">
            Mit Autonomie und Liebe zum Detail gebaut.
          </p>
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
    <section className="marketing-hero relative overflow-hidden bg-[#070b12] px-6 py-24 text-white sm:py-32">
      <div className="hero-orb hero-orb-one" aria-hidden="true" />
      <div className="hero-orb hero-orb-two" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <p className="text-sm font-semibold tracking-[.2em] text-cyan-300 uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-5xl text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance sm:text-7xl">
          {title}
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
          {text}
        </p>
        {children}
      </div>
    </section>
  );
}
