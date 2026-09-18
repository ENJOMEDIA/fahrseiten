"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { logoutAction } from "@/modules/auth/actions";
import { AutoSaveIndicator } from "@/components/forms/auto-save";

type NavItem = {
  href: string;
  label: string;
  icon?: string;
  description?: string;
};

function Navigation({
  items,
  mobile = false,
}: {
  items: readonly NavItem[];
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const root = items[0]?.href;
  return items.map((item) => {
    const active =
      pathname === item.href ||
      (item.href !== root && pathname.startsWith(`${item.href}/`));
    return (
      <Link
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition",
          active
            ? mobile
              ? "bg-slate-950 text-white"
              : "bg-white text-slate-950 shadow-lg shadow-black/10"
            : mobile
              ? "text-slate-700 hover:bg-slate-100"
              : "text-slate-400 hover:bg-white/8 hover:text-white",
        )}
        href={item.href}
        key={item.href}
      >
        <span
          aria-hidden="true"
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-xl text-xs font-bold",
            active
              ? "bg-cyan-100 text-cyan-800"
              : mobile
                ? "bg-slate-100 text-slate-500"
                : "bg-white/8 text-slate-400 group-hover:bg-white/12",
          )}
        >
          {item.icon ?? item.label.slice(0, 1)}
        </span>
        <span className="min-w-0">
          <span className="block font-semibold">{item.label}</span>
          {item.description && !mobile ? (
            <span
              className={cn(
                "mt-0.5 block truncate text-[11px]",
                active ? "text-slate-500" : "text-slate-600",
              )}
            >
              {item.description}
            </span>
          ) : null}
        </span>
      </Link>
    );
  });
}

export function AppShell({
  eyebrow,
  title,
  navigation,
  logoUrl,
  children,
}: {
  eyebrow: string;
  title: string;
  navigation: readonly NavItem[];
  logoUrl?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f3f6f8] lg:grid lg:grid-cols-[19rem_1fr]">
      <AutoSaveIndicator />
      <aside className="app-sidebar sticky top-0 hidden h-screen overflow-y-auto border-r border-white/5 bg-[#080d16] px-5 py-6 text-white lg:flex lg:flex-col">
        <Link className="flex items-center gap-3" href="/">
          {logoUrl ? (
            <span className="grid h-11 min-w-14 place-items-center rounded-2xl bg-white px-2 shadow-lg">
              <Image
                alt="Logo"
                className="h-7 w-auto object-contain"
                height={28}
                src={logoUrl}
                unoptimized
                width={120}
              />
            </span>
          ) : (
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-500 text-lg font-bold text-slate-950 shadow-lg shadow-cyan-500/20">
              F
            </span>
          )}
          <span>
            <span className="block font-semibold tracking-tight">
              FahrSeiten
            </span>
            <span className="block text-[10px] tracking-[.16em] text-slate-500 uppercase">
              by ENJO MEDIA
            </span>
          </span>
        </Link>
        <div className="mt-7 rounded-2xl border border-white/8 bg-white/[0.04] p-4">
          <p className="text-[10px] font-semibold tracking-[.16em] text-cyan-300 uppercase">
            Arbeitsbereich
          </p>
          <p className="mt-1 font-semibold">{eyebrow}</p>
        </div>
        <nav aria-label="Hauptnavigation" className="mt-6 space-y-1.5">
          <Navigation items={navigation} />
        </nav>
        <div className="mt-auto rounded-2xl border border-white/8 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold text-white">Hilfe benötigt?</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Über „Fehler melden“ oder den Supportbereich erreichst du die
            passende Stelle.
          </p>
          <form action={logoutAction} className="mt-4">
            <button
              className="w-full rounded-xl border border-white/10 px-3 py-2 text-left text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              type="submit"
            >
              Abmelden →
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 px-5 py-4 backdrop-blur-xl lg:px-8">
          <details className="group lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
              <span className="flex items-center gap-3">
                {logoUrl ? (
                  <span className="grid h-9 min-w-12 place-items-center rounded-xl bg-white px-2 shadow">
                    <Image
                      alt="Logo"
                      className="h-6 w-auto object-contain"
                      height={24}
                      src={logoUrl}
                      unoptimized
                      width={100}
                    />
                  </span>
                ) : (
                  <span className="grid size-9 place-items-center rounded-xl bg-slate-950 text-white">
                    F
                  </span>
                )}
                Menü
              </span>
              <span aria-hidden="true" className="text-xl group-open:rotate-45">
                +
              </span>
            </summary>
            <nav
              aria-label="Mobile Hauptnavigation"
              className="mt-4 grid gap-1 border-t border-slate-100 pt-4"
            >
              <Navigation items={navigation} mobile />
              <form
                action={logoutAction}
                className="mt-3 border-t border-slate-100 pt-3"
              >
                <button
                  className="w-full rounded-xl bg-slate-100 px-4 py-3 text-left text-sm font-semibold"
                  type="submit"
                >
                  Abmelden
                </button>
              </form>
            </nav>
          </details>
          <div className="hidden items-center justify-between lg:flex">
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                {eyebrow}
              </p>
              <p className="mt-0.5 font-semibold text-slate-950">{title}</p>
            </div>
            <div className="flex items-center gap-3">
              <details className="group relative">
                <summary
                  aria-label="Benachrichtigungen öffnen"
                  className="relative grid size-10 cursor-pointer list-none place-items-center rounded-full border border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-800"
                >
                  <svg
                    aria-hidden="true"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M10 21h4" />
                  </svg>
                  <span
                    aria-hidden="true"
                    className="absolute top-0 right-0 size-2.5 rounded-full border-2 border-white bg-cyan-500"
                  />
                </summary>
                <div className="absolute top-12 right-0 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <p className="font-semibold">Produkt-Hinweise</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Neuigkeiten aus deinem Arbeitsbereich
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <Link
                      className="block px-5 py-4 hover:bg-cyan-50"
                      href={
                        eyebrow === "Kundenverwaltung"
                          ? "/kunde/website/builder"
                          : "/admin/pakete"
                      }
                    >
                      <span className="text-sm font-semibold">
                        Website-Builder verfügbar
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Seiten, Medien und Designvorlagen lassen sich zentral
                        verwalten.
                      </span>
                    </Link>
                    <Link
                      className="block px-5 py-4 hover:bg-cyan-50"
                      href={
                        eyebrow === "Kundenverwaltung"
                          ? "/kunde/funktionen"
                          : "/admin/mandanten"
                      }
                    >
                      <span className="text-sm font-semibold">
                        FahrSeiten wächst weiter
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Benutzerverwaltung, Terminplanung, Erinnerungen und
                        weitere Module sind transparent vorbereitet.
                      </span>
                    </Link>
                  </div>
                </div>
              </details>
              <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                <span className="size-2 rounded-full bg-emerald-500" />
                Sicher angemeldet
              </span>
              <span className="grid size-10 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                {title.slice(0, 1).toUpperCase()}
              </span>
            </div>
          </div>
        </header>
        <main className="page-enter mx-auto w-full max-w-[94rem] px-5 py-8 lg:px-10 lg:py-10">
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
