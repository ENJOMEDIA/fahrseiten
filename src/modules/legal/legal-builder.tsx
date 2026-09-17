"use client";

import { useActionState, useMemo, useState } from "react";

import type { LegalActionState } from "@/app/kunde/rechtliches/actions";
import type { LegalModuleSettings, LegalProfileData } from "@/db/schema";

import { createStructuredLegalDocuments } from "./documents";

const initialState: LegalActionState = { message: "", error: false };

const moduleOptions: Array<{
  key: keyof LegalModuleSettings;
  title: string;
  text: string;
  locked?: boolean;
}> = [
  {
    key: "contactForm",
    title: "Kontaktformular",
    text: "Ergänzt Verarbeitung von Kontakt- und Nachrichtendaten.",
  },
  {
    key: "emailDelivery",
    title: "E-Mail-Versand",
    text: "Ergänzt die Übermittlung über den eingerichteten SMTP-Dienst.",
  },
  {
    key: "consentManagement",
    title: "Consent-Steuerung",
    text: "Beschreibt Auswahl, Nachweis und Widerruf optionaler Dienste.",
    locked: true,
  },
  {
    key: "maps",
    title: "Karten",
    text: "Für externe Karten und Standortdarstellungen.",
  },
  {
    key: "analytics",
    title: "Statistik",
    text: "Für Reichweitenmessung und Nutzungsanalyse.",
  },
  {
    key: "marketing",
    title: "Marketing",
    text: "Für Anzeigen, Kampagnenmessung und Remarketing.",
  },
  {
    key: "video",
    title: "Externe Videos",
    text: "Für eingebettete Inhalte von Videoplattformen.",
  },
  {
    key: "messaging",
    title: "SMS und Messenger",
    text: "Für SMS-, WhatsApp- oder vergleichbare Nachrichtendienste.",
  },
  {
    key: "onlineBooking",
    title: "Online-Terminbuchung",
    text: "Für Terminwünsche und spätere Buchungsfunktionen.",
  },
  {
    key: "payments",
    title: "Online-Zahlungen",
    text: "Für Zahlungsanbieter und Transaktionsdaten.",
  },
];

function TextField({
  label,
  name,
  defaultValue,
  required = false,
  type = "text",
}: {
  label: string;
  name: keyof LegalProfileData;
  defaultValue: string;
  required?: boolean;
  type?: "text" | "email" | "tel";
}) {
  return (
    <label className="block text-sm font-semibold text-slate-800">
      {label}
      <input
        className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-normal transition outline-none focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100"
        defaultValue={defaultValue}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function Toggle({
  checked,
  description,
  label,
  name,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  name: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-cyan-300">
      <input
        checked={checked}
        className="mt-1 size-5 accent-cyan-600"
        name={name}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span>
        <span className="block font-semibold text-slate-900">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-500">
          {description}
        </span>
      </span>
    </label>
  );
}

export function LegalBuilder({
  action: saveAction,
  profile,
  imprintStatus,
  privacyStatus,
  requiredModules = [],
}: {
  action: (
    state: LegalActionState,
    formData: FormData,
  ) => Promise<LegalActionState>;
  profile: { data: LegalProfileData; modules: LegalModuleSettings };
  imprintStatus: "draft" | "published" | "archived";
  privacyStatus: "draft" | "published" | "archived";
  requiredModules?: Array<keyof LegalModuleSettings>;
}) {
  const [state, action, pending] = useActionState(saveAction, initialState);
  const [registerType, setRegisterType] = useState(profile.data.registerType);
  const [regulated, setRegulated] = useState(profile.data.regulatedActivity);
  const [journalistic, setJournalistic] = useState(
    profile.data.journalisticContent,
  );
  const [dpo, setDpo] = useState(profile.data.dataProtectionOfficerRequired);
  const [modules, setModules] = useState(() =>
    requiredModules.reduce(
      (result, module) => ({ ...result, [module]: true }),
      profile.modules,
    ),
  );
  const preview = useMemo(
    () => createStructuredLegalDocuments({ data: profile.data, modules }),
    [modules, profile.data],
  );

  return (
    <form action={action} className="space-y-7">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-950 px-6 py-6 text-white sm:px-8">
          <p className="text-xs font-semibold tracking-[.18em] text-cyan-300 uppercase">
            Schritt 1
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Anbieterangaben</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Diese Felder bilden die gemeinsame Quelle für Impressum und
            Datenschutz. Der veröffentlichte Text kann nicht frei überschrieben
            werden.
          </p>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
          <TextField
            defaultValue={profile.data.companyName}
            label="Vollständiger Unternehmensname"
            name="companyName"
            required
          />
          <label className="block text-sm font-semibold text-slate-800">
            Rechtsform
            <select
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-normal"
              defaultValue={profile.data.legalForm}
              name="legalForm"
            >
              <option value="individual">Einzelunternehmen</option>
              <option value="gbr">GbR</option>
              <option value="ug">UG (haftungsbeschränkt)</option>
              <option value="gmbh">GmbH</option>
              <option value="other">Andere Rechtsform</option>
            </select>
          </label>
          <TextField
            defaultValue={profile.data.representativeName}
            label="Vertretungsberechtigte Person"
            name="representativeName"
            required
          />
          <TextField
            defaultValue={profile.data.email}
            label="Öffentliche E-Mail-Adresse"
            name="email"
            required
            type="email"
          />
          <TextField
            defaultValue={profile.data.phone}
            label="Telefon"
            name="phone"
            type="tel"
          />
          <TextField
            defaultValue={profile.data.street}
            label="Straße und Hausnummer"
            name="street"
            required
          />
          <TextField
            defaultValue={profile.data.postalCode}
            label="Postleitzahl"
            name="postalCode"
            required
          />
          <TextField
            defaultValue={profile.data.city}
            label="Ort"
            name="city"
            required
          />
          <TextField
            defaultValue={profile.data.country}
            label="Land"
            name="country"
            required
          />
          <TextField
            defaultValue={profile.data.vatId}
            label="Umsatzsteuer-ID, falls vorhanden"
            name="vatId"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold tracking-[.18em] text-cyan-700 uppercase">
          Schritt 2
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Bedingte Pflichtangaben</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Zusätzliche Felder erscheinen nur, wenn der jeweilige Sachverhalt
          zutrifft.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            Registereintrag
            <select
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-normal"
              name="registerType"
              onChange={(event) =>
                setRegisterType(
                  event.target.value as LegalProfileData["registerType"],
                )
              }
              value={registerType}
            >
              <option value="none">Kein Registereintrag</option>
              <option value="commercial">Handelsregister</option>
              <option value="partnership">Partnerschaftsregister</option>
              <option value="cooperative">Genossenschaftsregister</option>
              <option value="association">Vereinsregister</option>
            </select>
          </label>
          {registerType !== "none" ? (
            <>
              <TextField
                defaultValue={profile.data.registerCourt}
                label="Registergericht"
                name="registerCourt"
                required
              />
              <TextField
                defaultValue={profile.data.registerNumber}
                label="Registernummer"
                name="registerNumber"
                required
              />
            </>
          ) : (
            <>
              <input name="registerCourt" type="hidden" value="" />
              <input name="registerNumber" type="hidden" value="" />
            </>
          )}
          <Toggle
            checked={regulated}
            description="Für Fahrschulen ist regelmäßig eine behördliche Erlaubnis relevant."
            label="Erlaubnispflichtige Tätigkeit"
            name="regulatedActivity"
            onChange={setRegulated}
          />
          {regulated ? (
            <TextField
              defaultValue={profile.data.supervisoryAuthority}
              label="Zuständige Aufsichtsbehörde"
              name="supervisoryAuthority"
              required
            />
          ) : (
            <input name="supervisoryAuthority" type="hidden" value="" />
          )}
          <Toggle
            checked={journalistic}
            description="Nur aktivieren, wenn regelmäßig journalistisch-redaktionelle Inhalte erscheinen."
            label="Journalistisch-redaktionelle Inhalte"
            name="journalisticContent"
            onChange={setJournalistic}
          />
          {journalistic ? (
            <TextField
              defaultValue={profile.data.editorialResponsible}
              label="Inhaltlich verantwortliche Person"
              name="editorialResponsible"
              required
            />
          ) : (
            <input name="editorialResponsible" type="hidden" value="" />
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold tracking-[.18em] text-cyan-700 uppercase">
          Schritt 3
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Datenschutz-Grundlagen</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <TextField
            defaultValue={profile.data.privacyContactEmail}
            label="Datenschutz-Kontakt"
            name="privacyContactEmail"
            required
            type="email"
          />
          <TextField
            defaultValue={profile.data.hostingProvider}
            label="Hosting-Anbieter"
            name="hostingProvider"
            required
          />
          <label className="block text-sm font-semibold text-slate-800">
            Löschfrist für unverbindliche Anfragen
            <select
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-normal"
              defaultValue={profile.data.inquiryRetentionMonths}
              name="inquiryRetentionMonths"
            >
              <option value="3">3 Monate</option>
              <option value="6">6 Monate</option>
              <option value="12">12 Monate</option>
              <option value="24">24 Monate</option>
            </select>
          </label>
          <Toggle
            checked={dpo}
            description="Nur aktivieren, wenn ein Datenschutzbeauftragter bestellt wurde."
            label="Datenschutzbeauftragter vorhanden"
            name="dataProtectionOfficerRequired"
            onChange={setDpo}
          />
          {dpo ? (
            <TextField
              defaultValue={profile.data.dataProtectionOfficerEmail}
              label="Kontakt des Datenschutzbeauftragten"
              name="dataProtectionOfficerEmail"
              required
              type="email"
            />
          ) : (
            <input name="dataProtectionOfficerEmail" type="hidden" value="" />
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[.18em] text-cyan-700 uppercase">
          Schritt 4
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Aktive Module</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Nur aktivierte Module werden in die Datenschutzerklärung aufgenommen.
          Optionale externe Inhalte bleiben technisch bis zur Einwilligung
          blockiert.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {moduleOptions.map((module) => (
            <label
              className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 bg-white p-4"
              key={module.key}
            >
              <input
                checked={modules[module.key]}
                className="mt-1 size-5 accent-cyan-600"
                disabled={requiredModules.includes(module.key)}
                name={`module_${module.key}`}
                onChange={(event) =>
                  setModules((current) => ({
                    ...current,
                    [module.key]: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              {requiredModules.includes(module.key) ? (
                <input name={`module_${module.key}`} type="hidden" value="on" />
              ) : null}
              <span>
                <span className="font-semibold">
                  {module.title}
                  {requiredModules.includes(module.key) ? (
                    <span className="ml-2 rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] text-cyan-800 uppercase">
                      automatisch aktiv
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-sm leading-5 text-slate-500">
                  {module.text}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[.18em] text-cyan-700 uppercase">
              Vorschau
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Automatisch erzeugte Dokumente
            </h2>
          </div>
          <div className="flex gap-2 text-xs font-semibold">
            <span className="rounded-full border px-3 py-1">
              Impressum: {imprintStatus === "published" ? "online" : "Entwurf"}
            </span>
            <span className="rounded-full border px-3 py-1">
              Datenschutz:{" "}
              {privacyStatus === "published" ? "online" : "Entwurf"}
            </span>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <details className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <summary className="cursor-pointer font-semibold">
              Impressum ansehen
            </summary>
            <pre className="mt-5 overflow-auto font-sans text-sm leading-6 whitespace-pre-wrap text-slate-700">
              {preview.imprint}
            </pre>
          </details>
          <details className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <summary className="cursor-pointer font-semibold">
              Datenschutz ansehen
            </summary>
            <pre className="mt-5 max-h-[36rem] overflow-auto font-sans text-sm leading-6 whitespace-pre-wrap text-slate-700">
              {preview.privacy}
            </pre>
          </details>
        </div>
      </section>

      <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Vor der Veröffentlichung müssen Angaben, eingesetzte Anbieter und
            tatsächliche Prozesse fachlich und rechtlich geprüft werden.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full border border-slate-300 px-5 py-3 font-semibold"
              disabled={pending}
              name="intent"
              type="submit"
              value="draft"
            >
              Entwürfe aktualisieren
            </button>
            <button
              className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white"
              disabled={pending}
              name="intent"
              type="submit"
              value="publish"
            >
              Geprüfte Fassungen veröffentlichen
            </button>
          </div>
        </div>
        {state.message ? (
          <p
            aria-live="polite"
            className={`mt-3 text-sm font-semibold ${state.error ? "text-red-700" : "text-emerald-700"}`}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
