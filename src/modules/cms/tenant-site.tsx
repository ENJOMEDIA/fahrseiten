import Link from "next/link";

import { BlockRenderer } from "./block-renderer";
import type { PublishedPage, TenantWebsite } from "./types";

export function TenantSite({
  website,
  page,
}: {
  website: TenantWebsite;
  page: PublishedPage;
}) {
  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-950"
      style={
        {
          "--tenant-primary": website.theme.primaryColor,
        } as React.CSSProperties
      }
    >
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
          <Link className="text-lg font-bold" href="/">
            {website.name}
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
      </main>
      <footer className="border-t border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-600">
        Fiktive Demo-Website · keine echten Kunden- oder Kontaktdaten
      </footer>
    </div>
  );
}
