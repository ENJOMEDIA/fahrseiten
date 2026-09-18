import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/app-shell";
import { getSessionIdentity } from "@/modules/auth/session";
import { tenantHasPublishedLegalDocuments } from "@/modules/legal/repository";
import { findTenantMaintenance } from "@/modules/setup/maintenance";
import { createMembershipTenantContext } from "@/modules/tenancy/tenant-context";

export default async function CustomerDashboardPage() {
  const identity = await getSessionIdentity();
  const membership = identity?.memberships[0];
  const context =
    identity && membership
      ? createMembershipTenantContext({
          requestedTenantId: membership.tenantId,
          userId: identity.id,
          activeTenantIds: identity.memberships.map((item) => item.tenantId),
        })
      : null;
  const [site, legalReady] = context
    ? await Promise.all([
        findTenantMaintenance(context),
        tenantHasPublishedLegalDocuments(context.tenantId),
      ])
    : [null, false];
  const online = site ? !site.maintenanceMode : false;

  const steps = [
    {
      title: "Grundinhalte pflegen",
      text: "Klassen, Preise, Team, Fahrzeuge und Standorte ergänzen.",
      href: "/kunde/inhalte",
      done: false,
    },
    {
      title: "Rechtliches freigeben",
      text: "Pflichtangaben prüfen und beide Dokumente veröffentlichen.",
      href: "/kunde/rechtliches",
      done: legalReady,
    },
    {
      title: "Website veröffentlichen",
      text: "Wartungsmodus ausschalten, wenn alles geprüft ist.",
      href: "/kunde/einstellungen",
      done: online,
    },
  ];

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Kundenbereich" }, { label: "Dashboard" }]}
      />
      <section className="mt-6 overflow-hidden rounded-[2rem] bg-[#09111f] p-7 text-white shadow-xl shadow-slate-900/10 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[.2em] text-cyan-300 uppercase">
              Deine FahrSeiten-Zentrale
            </p>
            <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-[-0.04em] sm:text-6xl">
              Hallo {identity?.displayName ?? "und willkommen"}.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Hier pflegst du deine Website Schritt für Schritt. Änderungen
              bleiben als Entwurf gespeichert, bis du sie veröffentlichst.
            </p>
          </div>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-300 px-6 font-semibold text-slate-950"
            href="/kunde/website/builder"
          >
            Website bearbeiten →
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[.18em] text-cyan-700 uppercase">
                Deine nächsten Schritte
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Bereit für die Veröffentlichung
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {steps.filter((step) => step.done).length} von {steps.length}{" "}
              erledigt
            </span>
          </div>
          <div className="mt-7 space-y-3">
            {steps.map((step, index) => (
              <Link
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-4 hover:border-cyan-300 hover:shadow-md"
                href={step.href}
                key={step.title}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full font-semibold ${
                    step.done
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {step.done ? "✓" : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{step.title}</span>
                  <span className="mt-1 block text-sm text-slate-500">
                    {step.text}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-slate-300 group-hover:text-cyan-700"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div
          className={`rounded-[2rem] p-7 text-white ${online ? "bg-emerald-600" : "bg-amber-500"}`}
        >
          <p className="text-xs font-semibold tracking-[.18em] text-white/70 uppercase">
            Website-Status
          </p>
          <div className="mt-8 flex items-center gap-3">
            <span className="status-pulse size-3 rounded-full bg-white" />
            <span className="text-2xl font-semibold">
              {online ? "Öffentlich erreichbar" : "Wartungsmodus aktiv"}
            </span>
          </div>
          <p className="mt-4 leading-7 text-white/80">
            {online
              ? "Deine freigegebenen Inhalte werden auf der Kundendomain angezeigt."
              : "Besucher sehen deine gestaltete Wartungsseite, bis du die Website freigibst."}
          </p>
          <Link
            className="mt-8 inline-flex rounded-full bg-white px-5 py-3 font-semibold text-slate-950"
            href="/kunde/einstellungen"
          >
            Status verwalten
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-xs font-semibold tracking-[.18em] text-cyan-700 uppercase">
          Schnellzugriff
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Häufige Aufgaben
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "Inhalte",
              "Angebote und Fahrschuldaten pflegen",
              "/kunde/inhalte",
              "I",
            ],
            [
              "Anfragen",
              "Neue Interessenten beantworten",
              "/kunde/anfragen",
              "@",
            ],
            ["Medien", "Bilder und Dateien organisieren", "/kunde/medien", "▧"],
            ["Domain", "DNS- und SSL-Status ansehen", "/kunde/domain", "◎"],
          ].map(([title, text, href, icon]) => (
            <Link
              className="feature-card rounded-3xl border border-slate-200 bg-white p-6"
              href={href}
              key={href}
            >
              <span className="grid size-10 place-items-center rounded-2xl bg-cyan-50 font-semibold text-cyan-800">
                {icon}
              </span>
              <h3 className="mt-8 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              <span className="mt-6 block font-semibold text-cyan-800">
                Öffnen →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
