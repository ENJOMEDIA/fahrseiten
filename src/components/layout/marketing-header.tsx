import Link from "next/link";
import Image from "next/image";

import { dashboardUrl } from "@/config/dashboard-url";

export function MarketingHeader({ logoUrl }: { logoUrl?: string }) {
  const links = [
    ["Funktionen", "/funktionen"],
    ["Design & Demo", "/design"],
    ["Preise", "/preise"],
    ["FAQ", "/faq"],
    ["Beratung", "/kontakt"],
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link
          aria-label="FahrSeiten Startseite"
          className="group flex items-center gap-3 font-semibold tracking-tight text-slate-950"
          href="/"
        >
          {logoUrl ? (
            <span className="grid h-10 min-w-12 place-items-center rounded-xl bg-white px-2 shadow-lg shadow-slate-950/10">
              <Image
                alt="FahrSeiten Logo"
                className="h-7 w-auto object-contain"
                height={28}
                src={logoUrl}
                unoptimized
                width={120}
              />
            </span>
          ) : (
            <span className="grid size-9 place-items-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/15 transition-transform group-hover:-rotate-3">
              F
            </span>
          )}
          <span>
            FahrSeiten
            <span className="ml-2 hidden text-xs font-medium tracking-wide text-slate-400 sm:inline">
              by ENJO MEDIA
            </span>
          </span>
        </Link>
        <nav
          aria-label="Marketing-Navigation"
          className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex"
        >
          {links.map(([label, href]) => (
            <Link className="hover:text-slate-950" href={href} key={href}>
              {label}
            </Link>
          ))}
          <Link
            className="rounded-full bg-slate-950 px-5 py-2.5 text-white shadow-lg shadow-slate-950/10 hover:-translate-y-0.5 hover:bg-cyan-700"
            href={dashboardUrl()}
          >
            Login
          </Link>
        </nav>
        <details className="relative md:hidden">
          <summary className="cursor-pointer rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">
            Menü
          </summary>
          <nav
            aria-label="Mobile Marketing-Navigation"
            className="absolute right-0 z-20 mt-2 grid min-w-52 gap-1 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-medium shadow-xl"
          >
            {links.map(([label, href]) => (
              <Link
                className="rounded-lg px-3 py-2 hover:bg-cyan-50"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
            <Link
              className="rounded-lg bg-slate-950 px-3 py-2 text-white"
              href={dashboardUrl()}
            >
              Login
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
