"use client";

import { useActionState } from "react";

import {
  saveLetterTemplateAction,
  type LetterTemplateActionState,
} from "./actions";

const initialState: LetterTemplateActionState = { message: "", error: false };

export function LetterTemplateForm() {
  const [state, action, pending] = useActionState(
    saveLetterTemplateAction,
    initialState,
  );
  return (
    <form
      action={action}
      className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
    >
      <p className="text-xs font-bold tracking-[.16em] text-cyan-700 uppercase">
        Eigene Vorlage
      </p>
      <h2 className="mt-2 text-2xl font-semibold">Briefvorlage erstellen</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Verfügbar sind die Platzhalter {"{{Fahrschule}}"},{" "}
        {"{{Ansprechpartner}}"}, {"{{Tags}}"} und {"{{Kommentar}}"}. Tags und
        Recherche-Kommentar stammen aus der jeweiligen Kundenakte.
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
          Catcher-Zeile
          <input
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            maxLength={120}
            name="kickerTemplate"
            placeholder="WENIGER PFLEGE. MEHR ZEIT FÜRS FAHREN."
            required
          />
        </label>
        <label className="block text-sm font-semibold">
          Überschrift
          <input
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            name="headlineTemplate"
            required
          />
        </label>
        <label className="block text-sm font-semibold">
          Brieftext
          <textarea
            className="mt-1 min-h-64 w-full rounded-xl border border-slate-300 p-3 leading-6 font-normal"
            maxLength={1200}
            name="bodyTemplate"
            required
          />
        </label>
        <button className="premium-button" disabled={pending} type="submit">
          {pending ? "Wird gespeichert …" : "Vorlage speichern"}
        </button>
        {state.message ? (
          <p
            aria-live="polite"
            className={`text-sm font-semibold ${state.error ? "text-red-700" : "text-emerald-700"}`}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
