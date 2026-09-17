"use client";

import { useActionState } from "react";

import { resetPasswordAction } from "@/modules/auth/actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, {
    status: "idle" as const,
  });
  return (
    <form action={action} className="mt-8 space-y-5">
      <input name="token" type="hidden" value={token} />
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="password">
          Neues Passwort
        </label>
        <input
          autoComplete="new-password"
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          id="password"
          minLength={12}
          name="password"
          required
          type="password"
        />
      </div>
      {state.message ? <p aria-live="polite">{state.message}</p> : null}
      <button
        className="rounded-xl bg-slate-950 px-5 py-3 text-white"
        disabled={pending}
        type="submit"
      >
        Passwort ändern
      </button>
    </form>
  );
}
