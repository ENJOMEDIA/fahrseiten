"use client";

import { useState } from "react";

type OnboardingPrefill = {
  companyName?: string;
  ownerName?: string;
  ownerEmail?: string;
  phone?: string;
  domain?: string;
};

export function OnboardingLinkForm({
  leadId,
  initialValues = {},
  plans,
}: {
  leadId?: string;
  initialValues?: OnboardingPrefill;
  plans: {
    id: string;
    name: string;
    monthlyPriceCents: number;
    setupPriceCents: number;
    annualBillingEnabled: boolean;
    annualDiscountBasisPoints: number;
    minimumTermMonths: number;
  }[];
}) {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  async function createInstance(formData: FormData, sendInvitation: boolean) {
    setPending(true);
    setMessage("");
    const response = await fetch("/api/admin/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        companyName: formData.get("companyName"),
        ownerName: formData.get("ownerName"),
        ownerEmail: formData.get("ownerEmail"),
        phone: formData.get("phone"),
        domain: formData.get("domain"),
        leadId: formData.get("leadId"),
        planId: formData.get("planId"),
        billingIntervalMonths: Number(formData.get("billingIntervalMonths")),
        sendInvitation,
      }),
    });
    const result = (await response.json()) as {
      url?: string;
      invitationQueued?: boolean;
      invitationProcessed?: boolean;
      message?: string;
    };
    setPending(false);
    if (!response.ok || !result.url) {
      setMessage(
        result.message ?? "Die Instanz konnte nicht vorbereitet werden.",
      );
      return;
    }
    setUrl(result.url);
    setMessage(
      result.invitationProcessed
        ? "Die Instanz ist vorbereitet und die Einladungs-E-Mail wurde über den eingerichteten SMTP-Server versendet."
        : result.invitationQueued
          ? "Die Instanz ist vorbereitet. Der Versand wartet oder wird nach einem SMTP-Fehler automatisch wiederholt. Den genauen Status siehst du in der Mandantenübersicht."
          : "Die Instanz ist vorbereitet. Der persönliche Link ist sieben Tage gültig und wird nur jetzt vollständig angezeigt.",
    );
  }

  return (
    <form
      action={(formData) => createInstance(formData, false)}
      className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <input name="leadId" type="hidden" value={leadId ?? ""} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-cyan-700 uppercase">
            Neue Kundenwebsite
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Instanz vorbereiten</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Trage vorhandene Angaben vor. Die Fahrschule ergänzt anschließend
            nur noch fehlende Pflichtdaten, legt ihr Passwort fest und prüft die
            Angaben.
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          Einmal-Link · 7 Tage
        </span>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold sm:col-span-2">
          Gebuchtes Paket
          <select
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            name="planId"
            onChange={(event) => setSelectedPlanId(event.target.value)}
            required
          >
            <option value="">Paket auswählen</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} ·{" "}
                {(plan.monthlyPriceCents / 100).toLocaleString("de-DE", {
                  style: "currency",
                  currency: "EUR",
                })}
                /Monat ·{" "}
                {(plan.setupPriceCents / 100).toLocaleString("de-DE", {
                  style: "currency",
                  currency: "EUR",
                })}{" "}
                Einrichtung
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs font-normal text-slate-500">
            Die enthaltenen Funktionen werden bei Abschluss der Einrichtung
            serverseitig freigeschaltet.
          </span>
        </label>
        <label className="block text-sm font-semibold sm:col-span-2">
          Zahlungsweise
          <select
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            name="billingIntervalMonths"
            required
          >
            <option value="1">Monatliche Abrechnung zum regulären Preis</option>
            {selectedPlan?.annualBillingEnabled ? (
              <option value="12">
                Jahreszahlung mit {selectedPlan.annualDiscountBasisPoints / 100}{" "}
                % Preisvorteil
              </option>
            ) : null}
          </select>
          <span className="mt-1 block text-xs leading-5 font-normal text-slate-500">
            Zahlungsweise und Preisvorteil werden im Vertrag als fester
            Preisstand gespeichert. Die Mindestlaufzeit des gewählten Pakets
            beträgt {selectedPlan?.minimumTermMonths ?? "–"} Monat(e). Danach
            läuft der Vertrag unbefristet weiter und ist mit einem Monat Frist
            zum Monatsende kündbar.
          </span>
        </label>
        <Field
          defaultValue={initialValues.companyName}
          label="Fahrschule / Firma"
          name="companyName"
          required
        />
        <Field
          defaultValue={initialValues.ownerName}
          label="Ansprechperson / Inhaber"
          name="ownerName"
        />
        <Field
          defaultValue={initialValues.ownerEmail}
          label="E-Mail des Kunden"
          name="ownerEmail"
          type="email"
        />
        <Field
          defaultValue={initialValues.phone}
          label="Telefon"
          name="phone"
        />
        <div className="sm:col-span-2">
          <Field
            hint="Ohne https:// und ohne Pfad. Kann vom Kunden noch korrigiert werden."
            label="Gewünschte Domain"
            name="domain"
            placeholder="fahrschule-beispiel.de"
            defaultValue={initialValues.domain}
          />
        </div>
      </div>
      <div className="mt-7 rounded-2xl bg-slate-50 p-5">
        <p className="font-semibold">Was der Kunde anschließend erledigt</p>
        <ol className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
          <li>
            <strong className="text-slate-950">1.</strong> Angaben ergänzen
          </li>
          <li>
            <strong className="text-slate-950">2.</strong> Zugang festlegen
          </li>
          <li>
            <strong className="text-slate-950">3.</strong> Website im
            Wartungsmodus prüfen
          </li>
        </ol>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          {pending ? "Wird vorbereitet …" : "Link erstellen"}
        </button>
        <button
          className="rounded-full bg-cyan-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
          disabled={pending}
          formAction={(formData) => createInstance(formData, true)}
          type="submit"
        >
          Erstellen & per E-Mail senden
        </button>
      </div>
      {url ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <label className="text-sm font-semibold text-emerald-950">
            Persönlicher Einrichtungslink
            <input
              aria-label="Einrichtungslink"
              className="mt-2 w-full rounded-xl border border-emerald-200 bg-white p-3 font-normal"
              readOnly
              value={url}
            />
          </label>
        </div>
      ) : null}
      {message ? (
        <p
          aria-live="polite"
          className="mt-4 text-sm font-semibold text-slate-700"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  hint,
  placeholder,
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  hint?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
      {hint ? (
        <span className="mt-1 block text-xs font-normal text-slate-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
