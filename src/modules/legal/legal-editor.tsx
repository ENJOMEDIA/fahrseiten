"use client";

import { useActionState } from "react";

import type { LegalActionState } from "@/app/kunde/rechtliches/actions";

import { publicationWarnings } from "./documents";

const initialState: LegalActionState = { message: "", error: false };

export function LegalEditor({
  type,
  content,
  status,
  action: saveAction,
}: {
  type: "imprint" | "privacy" | "terms";
  content: string;
  status: "draft" | "published" | "archived";
  action: (
    state: LegalActionState,
    formData: FormData,
  ) => Promise<LegalActionState>;
}) {
  const [state, action, pending] = useActionState(saveAction, initialState);
  const warnings = publicationWarnings(type, content);
  return (
    <form action={action} className="rounded-2xl border bg-white p-5">
      <input name="type" type="hidden" value={type} />
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          {type === "imprint"
            ? "Impressum"
            : type === "privacy"
              ? "Datenschutz"
              : "Allgemeine Geschäftsbedingungen"}
        </h2>
        <span className="rounded-full border px-3 py-1 text-xs font-semibold">
          {status === "published" ? "Veröffentlicht" : "Entwurf"}
        </span>
      </div>
      <label className="mt-5 block font-semibold">
        Inhalt als Klartext
        <textarea
          className="mt-2 min-h-96 w-full rounded-xl border p-4 font-normal"
          defaultValue={content}
          maxLength={100_000}
          minLength={80}
          name="content"
          required
        />
      </label>
      <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
        <p className="font-semibold">Prüfung vor Veröffentlichung</p>
        <p className="mt-1">
          Die technische Vorlage ersetzt keine individuelle rechtliche Prüfung.
          Entferne alle eckigen Platzhalter und prüfe tatsächliche Dienste,
          Rechtsgrundlagen und Fristen.
        </p>
        {warnings.map((warning) => (
          <p className="mt-1" key={warning}>
            {warning}
          </p>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          className="rounded-full border px-5 py-2 font-semibold"
          disabled={pending}
          name="intent"
          type="submit"
          value="draft"
        >
          Entwurf speichern
        </button>
        <button
          className="rounded-full bg-slate-950 px-5 py-2 font-semibold text-white"
          disabled={pending}
          name="intent"
          type="submit"
          value="publish"
        >
          Als geprüft veröffentlichen
        </button>
      </div>
      {state.message ? (
        <p
          aria-live="polite"
          className={`mt-3 text-sm font-semibold ${state.error ? "text-red-700" : "text-emerald-700"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
