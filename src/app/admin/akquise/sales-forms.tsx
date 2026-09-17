"use client";

import { useActionState } from "react";

import {
  salesStageLabels,
  salesStages,
  type LeadStatus,
} from "@/modules/platform/sales-stages";

import {
  createLeadAction,
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
