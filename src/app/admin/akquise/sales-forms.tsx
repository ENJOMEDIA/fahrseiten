"use client";

import { useActionState } from "react";

import {
  salesStageLabels,
  salesStages,
  type LeadStatus,
} from "@/modules/platform/sales-stages";

import {
  createLeadAction,
  importSalesCsvAction,
  saveSalesTemplateAction,
  startOutreachAction,
  updateLeadAction,
  type SalesActionState,
} from "./actions";

const initialState: SalesActionState = { message: "", error: false };

function Result({ state }: { state: SalesActionState }) {
  return state.message ? (
    <p
      aria-live="polite"
      className={`mt-3 text-xs font-semibold ${state.error ? "text-red-700" : "text-emerald-700"}`}
    >
      {state.message}
    </p>
  ) : null;
}

export function CsvImportForm() {
  const [state, action, pending] = useActionState(
    importSalesCsvAction,
    initialState,
  );
  return (
    <form
      action={action}
      className="rounded-[2rem] border border-cyan-100 bg-cyan-50 p-6"
      encType="multipart/form-data"
    >
      <h2 className="text-xl font-semibold">Kontakte aus CSV übernehmen</h2>
      <p className="mt-2 text-sm text-slate-600">
        Die Kopfzeile wird geprüft. Kontakte mit bereits vorhandener
        E-Mail-Adresse werden übersprungen.
      </p>
      <input
        accept=".csv,text/csv"
        className="mt-5 block w-full text-sm"
        name="file"
        required
        type="file"
      />
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          className="premium-button disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          {pending ? "Importiert …" : "CSV importieren"}
        </button>
        <a
          className="text-sm font-semibold text-cyan-800 underline"
          href="/api/admin/akquise/csv-vorlage"
        >
          CSV-Vorlage herunterladen
        </a>
      </div>
      <Result state={state} />
    </form>
  );
}

export function SalesTemplateForm() {
  const [state, action, pending] = useActionState(
    saveSalesTemplateAction,
    initialState,
  );
  return (
    <form
      action={action}
      className="rounded-[2rem] border border-slate-200 bg-white p-6"
    >
      <h2 className="text-xl font-semibold">Neue Vorlage</h2>
      <p className="mt-2 text-sm text-slate-600">
        Erlaubte Platzhalter: {"{{Fahrschule}}"}, {"{{Ansprechpartner}}"},{" "}
        {"{{Webseite}}"} und {"{{Demo-Link}}"}. Die HTML-Fassung wird sicher aus
        diesem Text erzeugt.
      </p>
      <div className="mt-5 space-y-4">
        <label className="block text-sm font-semibold">
          Name
          <input
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            name="name"
            required
          />
        </label>
        <label className="block text-sm font-semibold">
          Betreff
          <input
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            name="subjectTemplate"
            required
          />
        </label>
        <label className="block text-sm font-semibold">
          E-Mail-Text
          <textarea
            className="mt-1 min-h-72 w-full rounded-xl border border-slate-300 p-3 font-normal"
            name="bodyTemplate"
            required
          />
        </label>
      </div>
      <button
        className="premium-button mt-5 disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? "Speichert …" : "Vorlage speichern"}
      </button>
      <Result state={state} />
    </form>
  );
}

export function OutreachForm({
  leads,
  templates,
}: {
  leads: {
    id: string;
    companyName: string;
    contactName: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    status: string;
  }[];
  templates: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(
    startOutreachAction,
    initialState,
  );
  return (
    <form action={action}>
      <div className="sticky top-4 z-10 mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <label className="min-w-64 flex-1 text-sm font-semibold">
          E-Mail-Vorlage
          <select
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            name="templateId"
            required
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="premium-button disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          {pending ? "Plant Versand …" : "Akquise für Auswahl starten"}
        </button>
        <Result state={state} />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="p-4">Auswahl</th>
              <th className="p-4">Fahrschule</th>
              <th className="p-4">Kontakt</th>
              <th className="p-4">Webseite</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="p-4">
                  <input
                    aria-label={`${lead.companyName} auswählen`}
                    disabled={!lead.email}
                    name="leadIds"
                    type="checkbox"
                    value={lead.id}
                  />
                </td>
                <td className="p-4 font-semibold">{lead.companyName}</td>
                <td className="p-4">
                  <div>{lead.contactName || "–"}</div>
                  <div className="text-slate-500">
                    {lead.email || lead.phone || "Keine Kontaktdaten"}
                  </div>
                </td>
                <td className="p-4">
                  {lead.website ? (
                    <a
                      className="text-cyan-800 underline"
                      href={lead.website}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Website öffnen
                    </a>
                  ) : (
                    "–"
                  )}
                </td>
                <td className="p-4">{lead.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}

export function CreateLeadForm() {
  const [state, action, pending] = useActionState(
    createLeadAction,
    initialState,
  );
  return (
    <details className="group rounded-[2rem] border border-cyan-100 bg-cyan-50 p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-cyan-950">
        <span>+ Interessent manuell anlegen</span>
        <span className="text-xl transition group-open:rotate-45">+</span>
      </summary>
      <form
        action={action}
        className="mt-5 grid gap-4 border-t border-cyan-100 pt-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <label className="text-sm font-semibold">
          Fahrschule / Firma
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="companyName"
            required
          />
        </label>
        <label className="text-sm font-semibold">
          Ansprechperson
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="contactName"
          />
        </label>
        <label className="text-sm font-semibold">
          E-Mail
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="email"
            type="email"
          />
        </label>
        <label className="text-sm font-semibold">
          Telefon
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="phone"
            type="tel"
          />
        </label>
        <label className="text-sm font-semibold">
          Website
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="website"
            placeholder="https://"
            type="url"
          />
        </label>
        <label className="text-sm font-semibold">
          Wiedervorlage
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-cyan-200 bg-white px-3 font-normal"
            name="nextTaskAt"
            type="datetime-local"
          />
        </label>
        <label className="text-sm font-semibold sm:col-span-2 lg:col-span-3">
          Erste Notiz
          <textarea
            className="mt-2 min-h-24 w-full rounded-xl border border-cyan-200 bg-white p-3 font-normal"
            name="note"
          />
        </label>
        <div>
          <button
            className="premium-button disabled:opacity-50"
            disabled={pending}
            type="submit"
          >
            {pending ? "Legt an …" : "Interessent anlegen"}
          </button>
          <Result state={state} />
        </div>
      </form>
    </details>
  );
}

export function LeadControls({
  lead,
}: {
  lead: { id: string; status: LeadStatus; nextTaskAt: Date | null };
}) {
  const [state, action, pending] = useActionState(
    updateLeadAction,
    initialState,
  );
  const dateValue = lead.nextTaskAt
    ? new Date(
        lead.nextTaskAt.getTime() -
          lead.nextTaskAt.getTimezoneOffset() * 60_000,
      )
        .toISOString()
        .slice(0, 16)
    : "";
  return (
    <details className="group mt-4 border-t border-slate-100 pt-3">
      <summary className="cursor-pointer list-none text-sm font-semibold text-cyan-800">
        Bearbeiten und Notiz erfassen →
      </summary>
      <form action={action} className="mt-3 space-y-3">
        <input name="id" type="hidden" value={lead.id} />
        <select
          className="min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm"
          defaultValue={lead.status}
          name="status"
        >
          {salesStages.map((status) => (
            <option key={status} value={status}>
              {salesStageLabels[status]}
            </option>
          ))}
        </select>
        <input
          className="min-h-10 w-full rounded-xl border border-slate-300 px-3 text-sm"
          defaultValue={dateValue}
          name="nextTaskAt"
          type="datetime-local"
        />
        <textarea
          className="min-h-20 w-full rounded-xl border border-slate-300 p-3 text-sm"
          name="note"
          placeholder="Gespräch, Ergebnis oder nächster Schritt …"
        />
        <button
          className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          {pending ? "Speichert …" : "Speichern"}
        </button>
        <Result state={state} />
      </form>
    </details>
  );
}
