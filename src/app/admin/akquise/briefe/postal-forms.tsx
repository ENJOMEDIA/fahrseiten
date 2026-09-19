"use client";

import { useActionState, useState } from "react";

import {
  deletePostalDispatchAction,
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

export function DeletePostalForm({
  dispatchId,
  submitted,
}: {
  dispatchId: string;
  submitted: boolean;
}) {
  const [state, action, pending] = useActionState(
    deletePostalDispatchAction,
    initialState,
  );
  return (
    <details className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
      <summary className="cursor-pointer text-xs font-semibold text-red-800">
        Briefvorgang löschen
      </summary>
      <p className="mt-2 text-xs leading-5 text-red-900">
        {submitted
          ? "FahrSeiten versucht zuerst, den Auftrag bei OnlineBrief24 zu löschen. Das ist laut Anbieter nur innerhalb von 15 Minuten und nicht mehr nach Abschluss möglich."
          : "Der lokale PDF-Entwurf und der Briefvorgang werden entfernt. Die Löschung bleibt in der Kundenhistorie nachvollziehbar."}
      </p>
      <form action={action} className="mt-3">
        <input name="dispatchId" type="hidden" value={dispatchId} />
        <button
          className="rounded-xl bg-red-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          {pending ? "Wird gelöscht …" : "Jetzt endgültig löschen"}
        </button>
        <Result state={state} />
      </form>
    </details>
  );
}

export function PreparePostalForm({
  leads,
  media,
  templates,
}: {
  leads: { id: string; companyName: string; addressComplete: boolean }[];
  media: { id: string; label: string }[];
  templates: {
    id: string;
    name: string;
    headlineTemplate: string;
    bodyTemplate: string;
  }[];
}) {
  const [state, action, pending] = useActionState(
    preparePostalDispatchAction,
    initialState,
  );
  const firstTemplate = templates[0];
  const [headline, setHeadline] = useState(
    firstTemplate?.headlineTemplate ??
      "Ihre Website sollte mitfahren – nicht aufhalten.",
  );
  const [bodyText, setBodyText] = useState(
    firstTemplate?.bodyTemplate ??
      "FahrSeiten verbindet einen modernen Webauftritt mit einem übersichtlichen Arbeitsbereich.",
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
        Briefvorlage
        <select
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
          defaultValue={firstTemplate?.id ?? ""}
          onChange={(event) => {
            const template = templates.find(
              (item) => item.id === event.target.value,
            );
            if (!template) return;
            setHeadline(template.headlineTemplate);
            setBodyText(template.bodyTemplate);
          }}
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs font-normal text-slate-500">
          Die Vorlage füllt Überschrift und Text. Beides kann für diesen Brief
          noch angepasst werden.
        </span>
      </label>
      <label className="block text-sm font-semibold">
        Überschrift
        <input
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
          name="headline"
          onChange={(event) => setHeadline(event.target.value)}
          required
          value={headline}
        />
      </label>
      <label className="block text-sm font-semibold">
        Persönlicher Brieftext
        <textarea
          className="mt-2 min-h-48 w-full rounded-xl border border-slate-300 p-3 leading-6 font-normal"
          maxLength={1200}
          name="bodyText"
          onChange={(event) => setBodyText(event.target.value)}
          required
          value={bodyText}
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
