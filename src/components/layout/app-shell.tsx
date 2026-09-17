import Link from "next/link";

import { cn } from "@/lib/cn";

type NavItem = { href: string; label: string; current?: boolean };

export function AppShell({
  eyebrow,
  title,
  navigation,
  children,
}: {
  eyebrow: string;
  title: string;
  navigation: readonly NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="hidden border-r border-slate-800 bg-slate-950 px-5 py-7 text-white lg:block">
        <p className="text-xs font-semibold tracking-[0.18em] text-cyan-300 uppercase">
          FahrSeiten
        </p>
        <p className="mt-2 text-lg font-semibold">{eyebrow}</p>
        <nav aria-label="Hauptnavigation" className="mt-8 space-y-1">
          {navigation.map((item) => (
            <Link
              className={cn(
                "block rounded-xl px-3 py-2.5 text-sm",
                item.current
                  ? "bg-cyan-500/20 text-cyan-100"
                  : "text-slate-300 hover:bg-white/10 hover:text-white",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <header className="border-b border-slate-200 bg-white px-5 py-4 lg:px-8">
          <details className="lg:hidden">
            <summary className="cursor-pointer font-semibold">Menü</summary>
            <nav
              aria-label="Mobile Hauptnavigation"
              className="mt-3 grid gap-1"
            >
              {navigation.map((item) => (
                <Link
                  className="rounded-lg px-3 py-2 hover:bg-slate-100"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
          <div className="hidden items-center justify-between lg:flex">
            <div>
              <p className="text-sm text-slate-500">{eyebrow}</p>
              <p className="font-semibold text-slate-950">{title}</p>
            </div>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-800">
              Lokale Demo
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: ReadonlyArray<{ label: string; href?: string }>;
}) {
  return (
    <nav aria-label="Brotkrümelnavigation">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        {items.map((item, index) => (
          <li
            className="flex items-center gap-2"
            key={`${item.label}-${index}`}
          >
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link className="hover:text-slate-950" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
