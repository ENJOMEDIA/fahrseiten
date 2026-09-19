import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/app-shell";
import { hasPlatformPermission } from "@/modules/auth/permissions";
import { getSessionIdentity } from "@/modules/auth/session";
import { readMigrationStatus } from "@/modules/operations/migration-status";

export default async function PlatformDashboardPage() {
  const identity = await getSessionIdentity();
  const role = identity?.platformRole ?? null;
  const migration = await readMigrationStatus();
  const cards = [
    {
      visible: hasPlatformPermission(role, "platform.tenants.manage"),
      number: "01",
      title: "Kunden & Domains",
      text: "Neue Fahrschulen einrichten, Domains begleiten und den Einrichtungsstand nachvollziehen.",
      href: "/admin/mandanten",
      action: "Mandanten verwalten",
      tone: "bg-cyan-50 text-cyan-950",
    },
    {
      visible: hasPlatformPermission(role, "platform.sales.manage"),
      number: "02",
      title: "Akquise",
      text: "Kundenakten, Gesprächsnotizen und nächste Schritte übersichtlich an einem Ort halten.",
      href: "/admin/akquise",
      action: "Akquise öffnen",
      tone: "bg-indigo-50 text-indigo-950",
    },
    {
      visible: hasPlatformPermission(role, "platform.support.diagnose"),
      number: "03",
      title: "Support & Betrieb",
      text: "Fehlermeldungen prüfen und technische Zustände ohne Kontoübernahme diagnostizieren.",
      href: "/admin/support",
      action: "Support öffnen",
      tone: "bg-white text-slate-950",
    },
  ].filter((card) => card.visible);

  return (
    <>
      <Breadcrumbs items={[{ label: "Plattform" }, { label: "Übersicht" }]} />
      <section className="mt-6 overflow-hidden rounded-[2rem] bg-[#09111f] p-7 text-white shadow-xl shadow-slate-900/10 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[.2em] text-cyan-300 uppercase">
              FahrSeiten Zentrale
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-semibold tracking-[-0.04em] sm:text-6xl">
              Guten Tag, {identity?.displayName ?? "Enrico"}.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Hier steuerst du Kunden, Akquise, Rechtliches und den technischen
              Betrieb der Plattform.
            </p>
          </div>
          {hasPlatformPermission(role, "platform.tenants.manage") ? (
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-300 px-6 font-semibold text-slate-950"
              href="/admin/mandanten/neu"
            >
              Neue Fahrschule anlegen →
            </Link>
          ) : null}
        </div>
      </section>

      {hasPlatformPermission(role, "platform.security.manage") ? (
        <Link
          className={`mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 ${
            migration.status === "error"
              ? "border-red-200 bg-red-50"
              : migration.status === "ready"
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
          }`}
          href="/admin/system"
        >
          <div>
            <p className="font-semibold">Datenbankschema</p>
            <p className="mt-1 text-sm text-slate-600">{migration.detail}</p>
          </div>
          <span className="font-semibold">Systemstatus öffnen →</span>
        </Link>
      ) : null}

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[.18em] text-cyan-700 uppercase">
              Arbeitsbereiche
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Was möchtest du erledigen?
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {cards.map((card) => (
            <article
              className={`feature-card flex min-h-72 flex-col rounded-[2rem] border border-slate-200 p-7 ${card.tone}`}
              key={card.href}
            >
              <p className="font-mono text-xs font-semibold tracking-widest opacity-45">
                {card.number}
              </p>
              <h3 className="mt-12 text-2xl font-semibold">{card.title}</h3>
              <p className="mt-3 leading-7 opacity-70">{card.text}</p>
              <Link className="mt-auto pt-7 font-semibold" href={card.href}>
                {card.action} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7">
          <p className="text-xs font-semibold tracking-[.18em] text-cyan-700 uppercase">
            Empfohlener Ablauf
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Von der Anfrage zur fertigen Fahrschulseite
          </h2>
          <ol className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              ["1", "Kontakt erfassen", "Kundenakte und Bedarf dokumentieren."],
              ["2", "Mandant anlegen", "Sicheren Einmal-Link erzeugen."],
              ["3", "Domain freigeben", "DNS, SSL und Inhalte kontrollieren."],
            ].map(([number, title, text]) => (
              <li className="rounded-2xl bg-slate-50 p-5" key={number}>
                <span className="grid size-8 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                  {number}
                </span>
                <p className="mt-4 font-semibold">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-[2rem] bg-cyan-600 p-7 text-white">
          <p className="text-xs font-semibold tracking-[.18em] text-cyan-100 uppercase">
            Recht & Freigabe
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Rechtstexte geführt erstellen
          </h2>
          <p className="mt-4 leading-7 text-cyan-50/80">
            Stammdaten und aktive Module erzeugen automatisch die passenden
            Dokumentabschnitte.
          </p>
          <Link
            className="mt-8 inline-flex rounded-full bg-white px-5 py-3 font-semibold text-cyan-900"
            href="/admin/rechtliches"
          >
            Rechtliches prüfen
          </Link>
        </div>
      </section>
    </>
  );
}
