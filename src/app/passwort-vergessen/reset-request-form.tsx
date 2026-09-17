"use client";

import { useActionState } from "react";

import { requestPasswordResetAction } from "@/modules/auth/actions";

export function ResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, {
    status: "idle" as const,
  });
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="email">
          E-Mail-Adresse
        </label>
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      {state.message ? <p aria-live="polite">{state.message}</p> : null}
      <button
        className="rounded-xl bg-slate-950 px-5 py-3 text-white"
        disabled={pending}
        type="submit"
      >
        Rücksetzung anfordern
      </button>
    </form>
  );
}
