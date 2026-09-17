"use client";

import { useActionState } from "react";

import { loginAction, type AuthActionState } from "@/modules/auth/actions";

const initialState: AuthActionState = { status: "idle" };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="email">
          E-Mail-Adresse
        </label>
        <input
          autoComplete="email"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="password">
          Passwort
        </label>
        <input
          autoComplete="current-password"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
          id="password"
          maxLength={200}
          name="password"
          required
          type="password"
        />
      </div>
      {state.message ? (
        <p
          aria-live="polite"
          className={
            state.status === "error" ? "text-red-700" : "text-emerald-700"
          }
        >
          {state.message}
        </p>
      ) : null}
      <button
        className="w-full rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Anmeldung läuft …" : "Anmelden"}
      </button>
    </form>
  );
}
