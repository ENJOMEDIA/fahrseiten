"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  submitPostalResponseAction,
  type PostalResponseState,
} from "./actions";

const initialState: PostalResponseState = { status: "idle" };

const choices = [
  {
    value: "interested",
    title: "Ja, ich habe Interesse",
    text: "Zeig mir FahrSeiten und lass uns über meine Fahrschule sprechen.",
  },
  {
    value: "unsure",
    title: "Ich bin mir noch nicht sicher",
    text: "Schick mir weitere Informationen per E-Mail, damit ich in Ruhe entscheiden kann.",
  },
  {
    value: "declined",
    title: "Kein Interesse",
    text: "Bitte sende mir keine weiteren Informationen oder Akquise-Nachrichten.",
  },
] as const;

export function PostalResponseForm({
  leadId,
  token,
}: {
  leadId: string;
  token: string;
}) {
  const [state, action, pending] = useActionState(
    submitPostalResponseAction,
    initialState,
  );
  const [selection, setSelection] = useState<
    "interested" | "unsure" | "declined" | ""
  >("");
  const wantsEmail = selection === "interested" || selection === "unsure";

  if (state.status === "success") {
    return (
      <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-7">
        <p className="text-sm font-bold tracking-[.16em] text-emerald-700 uppercase">
          Rückmeldung gespeichert
        </p>
        <h2 className="mt-3 text-3xl font-semibold">
          {state.response === "declined"
            ? "Alles klar – wir respektieren das."
            : "Schau bitte kurz in dein Postfach."}
        </h2>
        <p className="mt-4 leading-7 text-slate-700">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <input name="leadId" type="hidden" value={leadId} />
      <input name="token" type="hidden" value={token} />
      <fieldset>
        <legend className="text-lg font-semibold">
          Was passt gerade zu dir?
        </legend>
        <div className="mt-4 grid gap-3">
          {choices.map((choice) => (
            <label
              className={`cursor-pointer rounded-2xl border p-5 transition ${selection === choice.value ? "border-cyan-500 bg-cyan-50 shadow-lg shadow-cyan-900/5" : "border-slate-200 bg-white hover:border-cyan-200"}`}
              key={choice.value}
            >
              <span className="flex items-start gap-4">
                <input
                  className="mt-1 size-5"
                  name="response"
                  onChange={() => setSelection(choice.value)}
                  required
                  type="radio"
                  value={choice.value}
                />
                <span>
                  <strong className="block text-lg">{choice.title}</strong>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">
                    {choice.text}
                  </span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {wantsEmail ? (
        <div className="space-y-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
          <label className="block text-sm font-semibold">
            E-Mail-Adresse
            <input
              autoComplete="email"
              className="mt-2 min-h-12 w-full rounded-xl border border-cyan-200 bg-white px-4 font-normal"
              name="email"
              required
              type="email"
            />
          </label>
          <label className="flex items-start gap-3 text-sm leading-6 text-slate-700">
            <input
              className="mt-1 size-5 shrink-0"
              name="emailConsent"
              required
              type="checkbox"
              value="yes"
            />
            <span>
              Ich möchte die angeforderten Informationen und passende
              FahrSeiten-Angebote per E-Mail erhalten. Die Einwilligung ist
              freiwillig und jederzeit über den Abmeldelink widerrufbar. Es
              gelten die Hinweise im{" "}
              <Link className="font-semibold underline" href="/datenschutz">
                Datenschutz
              </Link>
              .
            </span>
          </label>
        </div>
      ) : selection === "declined" ? (
        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
          <input
            className="mt-1 size-5 shrink-0"
            name="acknowledged"
            required
            type="checkbox"
            value="yes"
          />
          Ich bestätige, dass ich keine weiteren werblichen Informationen von
          FahrSeiten erhalten möchte. Der Kontakt wird dafür dauerhaft gesperrt.
        </label>
      ) : null}
      {wantsEmail ? (
        <input name="acknowledged" type="hidden" value="yes" />
      ) : null}

      <button
        className="w-full rounded-full bg-slate-950 px-6 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800 disabled:opacity-50"
        disabled={pending || !selection}
        type="submit"
      >
        {pending ? "Wird gespeichert …" : "Antwort speichern"}
      </button>
      {state.status === "error" ? (
        <p aria-live="polite" className="text-sm font-semibold text-red-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
