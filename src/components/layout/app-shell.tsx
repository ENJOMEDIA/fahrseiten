"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { logoutAction } from "@/modules/auth/actions";
import { AutoSaveIndicator } from "@/components/forms/auto-save";

type NavItem = {
  href: string;
  label: string;
  icon?: string;
  description?: string;
  group?: string;
  badge?: string;
};

function Navigation({
  items,
  mobile = false,
  onNavigate,
}: {
  items: readonly NavItem[];
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const root = items[0]?.href;
  return items.map((item, index) => {
    const active =
      pathname === item.href ||
      (item.href !== root && pathname.startsWith(`${item.href}/`));
    const showGroup = Boolean(
      item.group && item.group !== items[index - 1]?.group,
    );
    return (
      <div className={showGroup ? "pt-4 first:pt-0" : ""} key={item.href}>
        {showGroup ? (
          <p
            className={cn(
              "mb-2 px-3 text-[10px] font-bold tracking-[.16em] uppercase",
              mobile ? "text-slate-400" : "text-slate-600",
            )}
          >
            {item.group}
          </p>
        ) : null}
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
          onClick={onNavigate}
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
            <span className="flex items-center gap-2 font-semibold">
              {item.label}
              {item.badge ? (
                <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[9px] font-bold tracking-wide text-cyan-800 uppercase">
                  {item.badge}
                </span>
              ) : null}
            </span>
            {item.description ? (
              <span
                className={cn(
                  "mt-0.5 block text-[11px] leading-4",
                  mobile ? "text-slate-500" : "truncate",
                  active ? "text-slate-500" : "text-slate-600",
                )}
              >
                {item.description}
              </span>
            ) : null}
          </span>
        </Link>
      </div>
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
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [desktopNavigationHidden, setDesktopNavigationHidden] = useState(false);
  const mobileNavigationRef = useRef<HTMLElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setDesktopNavigationHidden(
        window.localStorage.getItem("fahrseiten:sidebar-hidden") === "true",
      );
    });
  }, []);

  function toggleDesktopNavigation() {
    setDesktopNavigationHidden((current) => {
      const next = !current;
      window.localStorage.setItem("fahrseiten:sidebar-hidden", String(next));
      return next;
    });
  }

  useEffect(() => {
    if (!mobileNavigationOpen) return;
    const trigger = mobileTriggerRef.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavigationOpen(false);
      if (event.key !== "Tab") return;
      const focusable =
        mobileNavigationRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
      trigger?.focus();
    };
  }, [mobileNavigationOpen]);

  return (
    <div
      className={cn(
        "min-h-screen bg-[#f3f6f8] motion-reduce:transition-none lg:grid lg:transition-[grid-template-columns] lg:duration-300 lg:ease-out",
        desktopNavigationHidden
          ? "lg:grid-cols-[0rem_1fr]"
          : "lg:grid-cols-[19rem_1fr]",
      )}
    >
      <AutoSaveIndicator />
      <aside
        id="desktop-dashboard-navigation"
        className={cn(
          "app-sidebar sticky top-0 hidden h-screen w-[19rem] min-w-0 overflow-hidden border-r border-white/5 bg-[#080d16] px-5 py-6 text-white motion-reduce:transition-none lg:flex lg:flex-col lg:transition-[opacity,transform] lg:duration-300 lg:ease-out",
          desktopNavigationHidden
            ? "lg:pointer-events-none lg:-translate-x-4 lg:opacity-0"
            : "lg:translate-x-0 lg:opacity-100",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <Link className="flex min-w-0 items-center gap-3" href="/">
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
            <span className="min-w-0">
              <span className="block truncate font-semibold tracking-tight">
                FahrSeiten
              </span>
              <span className="block truncate text-[10px] tracking-[.16em] text-slate-500 uppercase">
                by ENJO MEDIA
              </span>
            </span>
          </Link>
          <button
            aria-controls="desktop-dashboard-navigation"
            aria-expanded="true"
            aria-label="Seitenmenü ausblenden"
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-300 transition hover:border-cyan-300/40 hover:bg-white/10 hover:text-white"
            onClick={toggleDesktopNavigation}
            title="Seitenmenü ausblenden"
            type="button"
          >
            <SidebarIcon collapsed={false} />
          </button>
        </div>
        <div className="mt-7 rounded-2xl border border-white/8 bg-white/[0.04] p-4">
          <p className="text-[10px] font-semibold tracking-[.16em] text-cyan-300 uppercase">
            Arbeitsbereich
          </p>
          <p className="mt-1 font-semibold">{eyebrow}</p>
        </div>
        <nav
          aria-label="Hauptnavigation"
          className="mt-5 min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pr-1 pb-4"
        >
          <Navigation items={navigation} />
        </nav>
        <div className="mt-3 shrink-0 rounded-2xl border border-white/8 bg-white/[0.04] p-4">
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
      <button
        aria-controls="desktop-dashboard-navigation"
        aria-expanded="false"
        aria-label="Seitenmenü einblenden"
        className={cn(
          "fixed top-4 left-3 z-[60] hidden size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-lg transition-[opacity,transform] duration-300 hover:border-cyan-300 hover:text-cyan-800 motion-reduce:transition-none lg:grid",
          desktopNavigationHidden
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-3 opacity-0",
        )}
        onClick={toggleDesktopNavigation}
        title="Seitenmenü einblenden"
        type="button"
      >
        <SidebarIcon collapsed />
      </button>
      <div className="min-w-0">
        {mobileNavigationOpen ? (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <button
              aria-label="Menü schließen"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => setMobileNavigationOpen(false)}
              type="button"
            />
            <aside
              aria-label="Mobile Hauptnavigation"
              aria-modal="true"
              className="mobile-navigation-enter absolute inset-y-0 left-0 flex w-[min(25rem,calc(100vw-1.25rem))] flex-col bg-white shadow-2xl"
              id="mobile-dashboard-navigation"
              ref={mobileNavigationRef}
              role="dialog"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <Link
                  className="flex min-w-0 items-center gap-3"
                  href="/"
                  onClick={() => setMobileNavigationOpen(false)}
                >
                  {logoUrl ? (
                    <span className="grid h-10 min-w-12 place-items-center rounded-xl border border-slate-100 bg-white px-2 shadow-sm">
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
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-950 font-bold text-white">
                      F
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {eyebrow}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {title}
                    </span>
                  </span>
                </Link>
                <button
                  aria-label="Menü schließen"
                  autoFocus
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-100 text-2xl text-slate-700"
                  onClick={() => setMobileNavigationOpen(false)}
                  type="button"
                >
                  ×
                </button>
              </div>
              <div className="mx-5 mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
                <span className="size-2.5 shrink-0 rounded-full bg-emerald-500" />
                Sicher als {title} angemeldet
              </div>
              <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-4 py-4">
                <Navigation
                  items={navigation}
                  mobile
                  onNavigate={() => setMobileNavigationOpen(false)}
                />
              </nav>
              <div className="border-t border-slate-200 bg-white p-4">
                <p className="mb-3 text-xs leading-5 text-slate-500">
                  Hilfe findest du jederzeit unter „Fehler melden“ oder im
                  Supportbereich.
                </p>
                <form action={logoutAction}>
                  <button
                    className="min-h-12 w-full rounded-xl bg-slate-950 px-4 py-3 text-left text-sm font-semibold text-white"
                    type="submit"
                  >
                    Sicher abmelden →
                  </button>
                </form>
              </div>
            </aside>
          </div>
        ) : null}
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-5 sm:py-4 lg:px-8">
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <div className="flex min-w-0 items-center gap-3">
              {logoUrl ? (
                <span className="grid h-9 min-w-11 place-items-center rounded-xl bg-white px-2 shadow-sm">
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
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                  F
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-[10px] font-bold tracking-[.12em] text-cyan-700 uppercase">
                  {eyebrow}
                </span>
                <span className="block truncate text-sm font-semibold text-slate-950">
                  {title}
                </span>
              </span>
            </div>
            <button
              aria-controls="mobile-dashboard-navigation"
              aria-expanded={mobileNavigationOpen}
              aria-label="Menü öffnen"
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm"
              onClick={() => setMobileNavigationOpen(true)}
              ref={mobileTriggerRef}
              type="button"
            >
              <span aria-hidden="true" className="grid gap-1">
                <span className="block h-0.5 w-5 rounded bg-current" />
                <span className="block h-0.5 w-5 rounded bg-current" />
                <span className="block h-0.5 w-5 rounded bg-current" />
              </span>
            </button>
          </div>
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
        <main className="app-main page-enter mx-auto w-full max-w-[94rem] px-4 py-6 sm:px-5 sm:py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <rect height="18" rx="3" width="18" x="3" y="3" />
      <path d="M9 3v18" />
      <path d={collapsed ? "m13 9 3 3-3 3" : "m16 9-3 3 3 3"} />
    </svg>
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
