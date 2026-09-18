import Link from "next/link";
import Image from "next/image";

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
  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-950"
      data-theme={website.theme.themeKey ?? "calm_cyan"}
      style={
        {
          "--tenant-primary": website.theme.primaryColor,
          "--tenant-accent": website.theme.accentColor,
        } as React.CSSProperties
      }
    >
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
          <Link
            className="flex items-center gap-3 text-lg font-bold"
            href={homeHref}
          >
            {website.theme.logoUrl ? (
              <Image
                alt={`Logo ${website.name}`}
                className="h-10 w-auto object-contain"
                height={40}
                src={website.theme.logoUrl}
                unoptimized
                width={160}
              />
            ) : null}
            <span>{website.name}</span>
          </Link>
          <nav aria-label="Hauptnavigation">
            <ul className="flex flex-wrap gap-5">
              {website.navigation
                .sort((a, b) => a.position - b.position)
                .map((item) => (
                  <li key={item.id}>
                    <Link
                      className="font-medium text-slate-700 hover:text-cyan-700"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </div>
      </header>
      <main>
        <BlockRenderer blocks={page.blocks} />
        {afterContent}
      </main>
      <footer
        className="border-t px-6 py-10 text-center text-sm text-white"
        style={{ backgroundColor: "var(--tenant-accent)" }}
      >
        <p>
          © {new Date().getFullYear()} {website.name}
        </p>
        <nav
          aria-label="Rechtliches"
          className="mt-3 flex justify-center gap-5"
        >
          <Link href={legalHref("/impressum")}>Impressum</Link>
          <Link href={legalHref("/datenschutz")}>Datenschutz</Link>
          <Link href="/cookie-einstellungen">Cookie-Einstellungen</Link>
        </nav>
      </footer>
    </div>
  );
}
