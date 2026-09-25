import Image from "next/image";
import Link from "next/link";

import { BlockRenderer } from "./block-renderer";
import type { PublishedPage, TenantWebsite } from "./types";

export function TenantSite({
  website,
  page,
  afterContent,
}: {
  website: TenantWebsite;
  page: PublishedPage;
  afterContent?: React.ReactNode;
}) {
  const homeHref = website.basePath || "/";
  const legalHref = (path: string) => `${website.basePath || ""}${path}`;
  const navigation = [...website.navigation].sort(
    (a, b) => a.position - b.position,
  );
  const contactHref = resolveTenantContactHref(website);
  return (
    <div
      className="tenant-site min-h-screen bg-white text-slate-950"
      data-theme={website.theme.themeKey ?? "calm_cyan"}
      data-font={website.theme.fontKey ?? "system_sans"}
      style={
        {
          "--tenant-primary": website.theme.primaryColor,
          "--tenant-accent": website.theme.accentColor,
        } as React.CSSProperties
      }
    >
      <header className="tenant-header sticky top-0 z-40 border-b border-white/70 bg-white/88 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
          <Link className="group flex items-center gap-3" href={homeHref}>
            {website.theme.logoUrl ? (
              <Image
                alt={`Logo ${website.name}`}
                className="h-11 w-auto object-contain"
                height={44}
                src={website.theme.logoUrl}
                unoptimized
                width={176}
              />
            ) : (
              <span
                aria-hidden="true"
                className="grid h-11 w-11 place-items-center rounded-2xl text-lg font-black text-white shadow-lg transition group-hover:scale-105 group-hover:-rotate-3"
                style={{ backgroundColor: "var(--tenant-primary)" }}
              >
                M
              </span>
            )}
            {!website.theme.logoUrl ? (
              <span>
                <span className="block text-base font-black tracking-tight sm:text-lg">
                  {website.name}
                </span>
                <span className="block text-[0.64rem] font-bold tracking-[0.18em] text-slate-500 uppercase">
                  Einfach besser fahren lernen
                </span>
              </span>
            ) : null}
          </Link>
          <nav aria-label="Hauptnavigation" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navigation.map((item) => {
                const active =
                  page.slug === ""
                    ? item.href === homeHref
                    : item.href.endsWith(`/${page.slug}`);
                return (
                  <li key={item.id}>
                    <Link
                      aria-current={active ? "page" : undefined}
                      className="rounded-full px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950 aria-[current=page]:bg-slate-950 aria-[current=page]:text-white"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              className="hidden rounded-full px-5 py-3 text-sm font-black text-white shadow-lg sm:inline-flex"
              href={contactHref}
              style={{ backgroundColor: "var(--tenant-primary)" }}
            >
              Jetzt anfragen
            </Link>
            <details className="tenant-mobile-menu relative lg:hidden">
              <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-full border border-slate-200 bg-white text-xl shadow-sm">
                <span aria-hidden="true">☰</span>
                <span className="sr-only">Menü öffnen</span>
              </summary>
              <nav className="absolute top-14 right-0 w-64 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl">
                <ul className="space-y-1">
                  {navigation.map((item) => (
                    <li key={item.id}>
                      <Link
                        className="block rounded-2xl px-4 py-3 font-bold text-slate-700 hover:bg-slate-100"
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>
          </div>
        </div>
      </header>
      <main>
        <BlockRenderer blocks={page.blocks} contactHref={contactHref} />
        {afterContent}
      </main>
      <footer className="tenant-footer px-6 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_.8fr_.8fr]">
          <div>
            <p className="text-2xl font-black tracking-tight">{website.name}</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">
              Klarer Ablauf, persönliche Begleitung und eine Fahrausbildung, die
              zu deinem Leben passt.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-white/45 uppercase">
              Navigation
            </p>
            <nav className="mt-4 grid gap-2 text-sm font-semibold">
              {navigation.slice(0, 4).map((item) => (
                <Link
                  className="w-fit hover:text-white/65"
                  href={item.href}
                  key={item.id}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-white/45 uppercase">
              Rechtliches
            </p>
            <nav className="mt-4 grid gap-2 text-sm font-semibold">
              <Link
                className="w-fit hover:text-white/65"
                href={legalHref("/impressum")}
              >
                Impressum
              </Link>
              <Link
                className="w-fit hover:text-white/65"
                href={legalHref("/datenschutz")}
              >
                Datenschutz
              </Link>
              <Link
                className="w-fit hover:text-white/65"
                href="/cookie-einstellungen"
              >
                Cookie-Einstellungen
              </Link>
            </nav>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-7 text-xs text-white/45">
          <p>
            © {new Date().getFullYear()} {website.name}
          </p>
          <p>Mit FahrSeiten, Autonomie und Liebe zum Detail gebaut.</p>
        </div>
      </footer>
    </div>
  );
}

export function resolveTenantContactHref(website: TenantWebsite) {
  const contactItem = [...website.navigation]
    .sort((a, b) => a.position - b.position)
    .find((item) => {
      const path = item.href.split(/[?#]/, 1)[0].replace(/\/+$/, "");
      const label = item.label.toLocaleLowerCase("de-DE");
      return (
        path.endsWith("/kontakt") ||
        label.includes("kontakt") ||
        label.includes("anfrag")
      );
    });
  if (contactItem) return contactItem.href;
  const home = (website.basePath || "/").replace(/\/+$/, "") || "/";
  return home === "/" ? "/#kontakt" : `${home}#kontakt`;
}
