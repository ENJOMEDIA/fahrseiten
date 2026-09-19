"use client";

import { useActionState } from "react";

import {
  preparePostalDispatchAction,
  submitPostalDispatchAction,
  type PostalActionState,
} from "./actions";

const initialState: PostalActionState = { message: "", error: false };

function Result({ state }: { state: PostalActionState }) {
  return state.message ? (
    <p
      aria-live="polite"
      className={`mt-3 text-sm font-semibold ${state.error ? "text-red-700" : "text-emerald-700"}`}
    >
      {state.message}
    </p>
  ) : null;
}

export function PreparePostalForm({
  leads,
  media,
}: {
  leads: { id: string; companyName: string; addressComplete: boolean }[];
  media: { id: string; label: string }[];
}) {
  const [state, action, pending] = useActionState(
    preparePostalDispatchAction,
    initialState,
  );
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-semibold">
        Kundenakte
        <select
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
          name="leadId"
          required
        >
          <option value="">Bitte auswählen</option>
          {leads.map((lead) => (
            <option
              disabled={!lead.addressComplete}
              key={lead.id}
              value={lead.id}
            >
              {lead.companyName}
              {lead.addressComplete ? "" : " – Anschrift fehlt"}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold">
        Überschrift
        <input
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
          defaultValue="Eine Website, die Ihrer Fahrschule Arbeit abnimmt."
          name="headline"
          required
        />
      </label>
      <label className="block text-sm font-semibold">
        Persönlicher Brieftext
        <textarea
          className="mt-2 min-h-48 w-full rounded-xl border border-slate-300 p-3 leading-6 font-normal"
          defaultValue={
            "FahrSeiten verbindet einen modernen Webauftritt mit einem übersichtlichen Arbeitsbereich: Klassen, Preise, Kurse, Fahrzeuge, Team, Standorte und Anfragen lassen sich selbst pflegen – ohne technischen Daueraufwand. Gestaltung und Bausteine bleiben dabei bewusst geführt, damit die Seite auch nach Änderungen hochwertig wirkt.\n\nScannen Sie Ihren persönlichen QR-Code. Dort können Sie unverbindlich Interesse anmelden, weitere Informationen anfordern oder jede weitere Ansprache ablehnen."
          }
          name="bodyText"
          required
        />
      </label>
      <label className="block text-sm font-semibold">
        Optionales Bild aus dem Plattform-Medienbereich
        <select
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
          name="imageMediaId"
        >
          <option value="">Ohne zusätzliches Bild</option>
          {media.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold">
        <input defaultChecked name="color" type="checkbox" value="yes" />
        Farbdruck verwenden
      </label>
      <button className="premium-button" disabled={pending} type="submit">
        {pending ? "PDF wird erstellt …" : "Akquisebrief vorbereiten"}
      </button>
      <Result state={state} />
    </form>
  );
}

export function SubmitPostalForm({
  dispatchId,
  leadId,
  mode,
}: {
  dispatchId: string;
  leadId: string;
  mode: "test" | "live";
}) {
  const [state, action, pending] = useActionState(
    submitPostalDispatchAction,
    initialState,
  );
  return (
    <form action={action} className="mt-3">
      <input name="dispatchId" type="hidden" value={dispatchId} />
      {mode === "live" ? (
        <label className="block text-xs font-semibold text-red-900">
          Kostenpflichtigen Versand mit Lead-ID bestätigen
          <input
            className="mt-1 min-h-10 w-full rounded-xl border border-red-200 px-3 font-mono font-normal"
            name="liveConfirmation"
            placeholder={leadId}
            required
          />
        </label>
      ) : (
        <input name="liveConfirmation" type="hidden" value="" />
      )}
      <button
        className={`mt-3 rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 ${mode === "test" ? "bg-cyan-700" : "bg-red-700"}`}
        disabled={pending}
        type="submit"
      >
        {pending
          ? "Wird übertragen …"
          : mode === "test"
            ? "An OnlineBrief24-Testwarenkorb senden"
            : "Kostenpflichtig live versenden"}
      </button>
      <Result state={state} />
    </form>
  );
}
