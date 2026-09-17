"use client";

import { useActionState, useState } from "react";

import { deleteTenantAction, type TenantDeleteActionState } from "./actions";

const initialState: TenantDeleteActionState = { message: "", error: false };

export function TenantDeleteForm({
  tenantId,
  tenantName,
}: {
  tenantId: string;
  tenantName: string;
}) {
  const [state, action, pending] = useActionState(
    deleteTenantAction,
    initialState,
  );
  const [confirmation, setConfirmation] = useState("");
  const confirmed = confirmation.trim() === tenantName;

  return (
    <form action={action} className="mt-5">
      <input name="tenantId" type="hidden" value={tenantId} />
      <label className="block text-sm font-semibold text-red-950">
        Zur Bestätigung „{tenantName}“ eingeben
        <input
          autoComplete="off"
          className="mt-2 min-h-11 w-full rounded-xl border border-red-200 bg-white px-3 font-normal outline-none focus:border-red-500 focus:ring-3 focus:ring-red-100"
          name="confirmation"
          onChange={(event) => setConfirmation(event.target.value)}
          required
          value={confirmation}
        />
      </label>
      <button
        className="mt-3 rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!confirmed || pending}
        type="submit"
      >
        {pending ? "Mandant wird gelöscht …" : "Mandant endgültig löschen"}
      </button>
      {state.message ? (
        <p
          aria-live="polite"
          className={`mt-3 text-sm font-semibold ${state.error ? "text-red-800" : "text-emerald-700"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
