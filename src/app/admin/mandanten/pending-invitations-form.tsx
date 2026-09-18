"use client";

import { useActionState } from "react";

import {
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
