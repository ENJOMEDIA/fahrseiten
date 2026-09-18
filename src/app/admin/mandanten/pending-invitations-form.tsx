"use client";

import { useActionState, useState } from "react";

import {
  cancelPendingInstanceAction,
  processPendingInvitations,
  type InvitationProcessingState,
} from "./actions";

const initialState: InvitationProcessingState = {
  message: "",
  error: false,
};

export function PendingInvitationsForm() {
  const [state, action, pending] = useActionState(
    processPendingInvitations,
    initialState,
  );
  return (
    <form action={action} className="flex flex-col items-end gap-2">
      <button
        className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Versand wird geprüft …" : "Ausstehenden Versand prüfen"}
      </button>
      {state.message ? (
        <p
          aria-live="polite"
          className={`max-w-sm rounded-xl px-3 py-2 text-right text-xs font-semibold ${
            state.error
              ? "bg-red-100 text-red-900"
              : "bg-white text-emerald-800 shadow-sm"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function CancelPendingInstanceForm({
  setupId,
  displayName,
}: {
  setupId: string;
  displayName: string;
}) {
  const [state, action, pending] = useActionState(
    cancelPendingInstanceAction,
    initialState,
  );
  const [confirmation, setConfirmation] = useState("");
  return (
    <details className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
      <summary className="cursor-pointer text-xs font-semibold text-red-800">
        Einrichtung stornieren
      </summary>
      <form action={action} className="mt-3 space-y-3">
        <input name="setupId" type="hidden" value={setupId} />
        <p className="text-xs leading-5 text-red-900">
          Der Einrichtungslink wird sofort ungültig. Ein vorhandener
          Akquise-Kontakt bleibt für deine Dokumentation erhalten.
        </p>
        <label className="block text-xs font-semibold text-red-950">
          Zur Bestätigung „{displayName}“ eingeben
          <input
            autoComplete="off"
            className="mt-2 min-h-10 w-full rounded-xl border border-red-200 bg-white px-3 font-normal"
            name="confirmation"
            onChange={(event) => setConfirmation(event.target.value)}
            value={confirmation}
          />
        </label>
        <button
          className="rounded-xl bg-red-700 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={confirmation.trim() !== displayName || pending}
          type="submit"
        >
          {pending ? "Wird storniert …" : "Einrichtung endgültig stornieren"}
        </button>
        {state.message ? (
          <p
            aria-live="polite"
            className={`text-xs font-semibold ${state.error ? "text-red-800" : "text-emerald-700"}`}
          >
            {state.message}
          </p>
        ) : null}
      </form>
    </details>
  );
}
