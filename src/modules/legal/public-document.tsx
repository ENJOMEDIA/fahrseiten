"use client";

import Link from "next/link";

import { OpenConsentSettingsButton } from "@/modules/consent/consent-manager";
import type { OptionalService } from "@/modules/consent/config";

export function PublicLegalDocument({
  brandName,
  title,
  content,
  optionalServices = [],
}: {
  brandName: string;
  title: string;
  content: string;
  optionalServices?: OptionalService[];
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 sm:py-12">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
        <Link
          className="inline-flex min-h-11 items-center rounded-full border border-slate-200 px-4 font-semibold text-cyan-800 transition-colors hover:border-cyan-300 hover:bg-cyan-50"
          href="/"
        >
          ← {brandName}
        </Link>
        <p className="mt-10 text-xs font-bold tracking-[.16em] text-cyan-700 uppercase">
          Rechtliche Informationen
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <LegalContent content={content} title={title} />
        {title === "Datenschutz" && optionalServices.length ? (
          <PrivacyServiceNotice services={optionalServices} />
        ) : null}
      </article>
    </main>
  );
}

export function PublicLegalDocumentUnavailable({
  brandName,
  title,
}: {
  brandName: string;
  title: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 py-12 text-white">
      <meta content="noindex, nofollow" name="robots" />
      <article className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 shadow-2xl backdrop-blur sm:p-10">
        <Link className="font-semibold text-cyan-300" href="/">
          ← {brandName}
        </Link>
        <p className="mt-10 text-xs font-bold tracking-[.16em] text-cyan-300 uppercase">
          Veröffentlichung wird vorbereitet
        </p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-5 max-w-xl leading-7 text-slate-300">
          Dieses Dokument wurde noch nicht freigegeben. Die Website bleibt bis
          zur Prüfung und Veröffentlichung der rechtlichen Angaben im
          Wartungsmodus.
        </p>
      </article>
    </main>
  );
}

export function LegalContent({
  content,
  title,
}: {
  content: string;
  title: string;
}) {
  const sections = content
    .replaceAll("\r\n", "\n")
    .split(/\n{2,}/)
    .map((section) => section.trim())
    .filter(
      (section) =>
        section &&
        ![title, "Impressum", "Datenschutzerklärung"].includes(section),
    );
  const headingPattern =
    /^(?:\d+[.)]\s+|Angaben gemäß|Anbieter|Anschrift|Vertretung|Kontakt|Handelsregister|Partnerschaftsregister|Genossenschaftsregister|Vereinsregister|Umsatzsteuer|Zuständige|Verantwortlich|Postalische Akquise|Newsletter und Produktinformationen|Empfehlungsprogramm|Datenschutzbeauftragter|Hosting|Betroffenenrechte|Speicherdauer)/;

  return (
    <div className="mt-8 space-y-4 text-slate-700 sm:mt-10">
      {sections.map((section, index) => {
        const [heading, ...lines] = section.split("\n");
        const isHeading = headingPattern.test(heading);
        const isLegalBasis = /^Angaben gemäß/.test(heading) && !lines.length;
        if (isLegalBasis)
          return (
            <p
              className="rounded-2xl border border-cyan-100 bg-cyan-50/70 px-5 py-4 text-sm leading-6 font-medium text-cyan-950"
              key={`${heading}-${index}`}
            >
              {heading}
            </p>
          );
        return (
          <section
            className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-5 py-5 shadow-[0_1px_0_rgba(15,23,42,.02)] sm:px-6 sm:py-6"
            key={`${heading}-${index}`}
          >
            {isHeading ? (
              <h2 className="text-lg leading-7 font-semibold tracking-tight text-slate-950 sm:text-xl">
                {heading}
              </h2>
            ) : null}
            <div
              className={`${isHeading ? "mt-4" : ""} space-y-2 text-[0.96rem] leading-7 sm:text-base sm:leading-8`}
            >
              {(isHeading ? lines : [heading, ...lines]).map(
                (line, lineIndex) => {
                  const label = line.match(/^([^:]{1,45}):\s+(.+)$/);
                  return (
                    <p
                      className="[overflow-wrap:anywhere]"
                      key={`${line}-${lineIndex}`}
                    >
                      {label ? (
                        <>
                          <span className="font-semibold text-slate-950">
                            {label[1]}:
                          </span>{" "}
                          {label[2]}
                        </>
                      ) : (
                        line
                      )}
                    </p>
                  );
                },
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function PrivacyServiceNotice({
  services,
}: {
  services: OptionalService[];
}) {
  if (!services.length) return null;
  return (
    <section className="mt-6 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-5 sm:p-6">
      <p className="text-xs font-bold tracking-[.14em] text-cyan-700 uppercase">
        Einwilligungspflichtige Funktionen
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">
        Aktuell aktivierte optionale Dienste
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Diese Übersicht wird automatisch aus den aktivierten Modulen erzeugt.
        Die Dienste bleiben technisch blockiert, bis eine passende Einwilligung
        erteilt wurde.
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {services.map((service, index) => (
          <li
            className="rounded-xl border border-cyan-100 bg-white/80 p-4 text-sm leading-6"
            key={`${service.category}-${index}`}
          >
            <strong className="block text-slate-950">{service.label}</strong>
            {service.services}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PublicCookieSettings({
  brandName,
  optionalServices,
}: {
  brandName: string;
  optionalServices: OptionalService[];
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 sm:py-12">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
        <Link
          className="inline-flex min-h-11 items-center rounded-full border border-slate-200 px-4 font-semibold text-cyan-800"
          href="/"
        >
          ← {brandName}
        </Link>
        <p className="mt-10 text-xs font-bold tracking-[.16em] text-cyan-700 uppercase">
          Datenschutz
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Cookie-Einstellungen
        </h1>
        <CookieSettingsOverview optionalServices={optionalServices} />
      </article>
    </main>
  );
}

export function CookieSettingsOverview({
  optionalServices,
}: {
  optionalServices: OptionalService[];
}) {
  return (
    <div className="mt-8 space-y-4">
      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 sm:p-6">
        <p className="text-xs font-bold tracking-[.14em] text-emerald-700 uppercase">
          Immer aktiv
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Notwendige Funktionen
        </h2>
        <p className="mt-3 leading-7 text-slate-600">
          Sitzung und Sicherheitsfunktionen sind für den sicheren Betrieb
          erforderlich und können nicht deaktiviert werden.
        </p>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
        <p className="text-xs font-bold tracking-[.14em] text-cyan-700 uppercase">
          Deine Auswahl
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Optionale Dienste
        </h2>
        <p className="mt-3 leading-7 text-slate-600">
          {optionalServices.length === 0
            ? "Derzeit sind keine optionalen Analyse-, Karten- oder Marketingdienste aktiv. Deshalb wird keine unnötige Einwilligung abgefragt."
            : "Diese Dienste werden erst nach einer passenden Einwilligung geladen. Deine Auswahl kannst du jederzeit ändern oder widerrufen."}
        </p>
        {optionalServices.length ? (
          <>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {optionalServices.map((service, index) => (
                <li
                  className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6"
                  key={`${service.category}-${index}`}
                >
                  <strong className="block text-slate-950">
                    {service.label}
                  </strong>
                  {service.services}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <OpenConsentSettingsButton />
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
