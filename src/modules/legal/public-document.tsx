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
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
      <article className="mx-auto max-w-3xl rounded-3xl border bg-white p-7 shadow-sm sm:p-10">
        <Link className="font-semibold text-cyan-800" href="/">
          ← {brandName}
        </Link>
        <h1 className="mt-8 text-3xl font-semibold">{title}</h1>
        <div className="mt-8 leading-7 whitespace-pre-wrap text-slate-700">
          {content}
        </div>
        {title === "Datenschutz" && optionalServices.length ? (
          <PrivacyServiceNotice services={optionalServices} />
        ) : null}
      </article>
    </main>
  );
}

export function PrivacyServiceNotice({
  services,
}: {
  services: OptionalService[];
}) {
  if (!services.length) return null;
  return (
    <section className="mt-8 rounded-2xl border border-cyan-100 bg-cyan-50 p-6">
      <h2 className="text-xl font-semibold">
        Aktuell aktivierte optionale Dienste
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Diese Übersicht wird automatisch aus den aktivierten Modulen erzeugt.
        Die Dienste bleiben technisch blockiert, bis eine passende Einwilligung
        erteilt wurde.
      </p>
      <ul className="mt-4 space-y-3">
        {services.map((service, index) => (
          <li key={`${service.category}-${index}`}>
            <strong>{service.label}:</strong> {service.services}
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
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
      <article className="mx-auto max-w-3xl rounded-3xl border bg-white p-7 shadow-sm sm:p-10">
        <Link className="font-semibold text-cyan-800" href="/">
          ← {brandName}
        </Link>
        <h1 className="mt-8 text-3xl font-semibold">Cookie-Einstellungen</h1>
        <p className="mt-5 leading-7 text-slate-700">
          Technisch notwendige Funktionen sind immer aktiv. Optionale
          funktionale, Statistik- und Marketingdienste bleiben ohne passende
          Einwilligung blockiert. Eine Auswahl kann hier jederzeit geändert oder
          widerrufen werden.
        </p>
        {optionalServices.length > 0 ? (
          <div className="mt-8">
            <OpenConsentSettingsButton />
          </div>
        ) : (
          <p className="mt-5 rounded-xl bg-slate-100 p-4">
            Derzeit sind keine optionalen Dienste aktiv. Deshalb wird keine
            Einwilligung abgefragt.
          </p>
        )}
      </article>
    </main>
  );
}
