"use client";

import { useActionState, useState } from "react";

import {
  activateReferralAction,
  setReferralActiveAction,
  type ReferralActionState,
} from "./actions";

const initialState: ReferralActionState = { message: "", error: false };

export function ReferralControls({
  active,
  shareUrl,
}: {
  active?: boolean;
  shareUrl?: string | null;
}) {
  const [activateState, activate, activatePending] = useActionState(
    activateReferralAction,
    initialState,
  );
  const [statusState, setStatus, statusPending] = useActionState(
    setReferralActiveAction,
    initialState,
  );
  const [copied, setCopied] = useState(false);
  const state = activateState.message ? activateState : statusState;

  if (!shareUrl) {
    return (
      <form action={activate}>
        <button
          className="rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
          disabled={activatePending}
        >
          {activatePending ? "Wird aktiviert …" : "Empfehlungslink aktivieren"}
        </button>
        {state.message ? (
          <p
            className={`mt-3 text-sm ${state.error ? "text-red-700" : "text-emerald-700"}`}
          >
            {state.message}
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold" htmlFor="referral-link">
        Persönlicher Link
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm"
          id="referral-link"
          readOnly
          value={shareUrl}
        />
        <button
          className="rounded-xl border border-slate-300 px-4 py-2 font-semibold"
          onClick={async () => {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
          }}
          type="button"
        >
          {copied ? "Kopiert" : "Link kopieren"}
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <a
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"
          href="/api/kunde/empfehlungs-qr"
          download="fahrseiten-empfehlung.png"
        >
          QR-Code laden
        </a>
        <form action={setStatus}>
          <input
            name="active"
            type="hidden"
            value={active ? "false" : "true"}
          />
          <button
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-60"
            disabled={statusPending}
          >
            {active ? "Link pausieren" : "Link aktivieren"}
          </button>
        </form>
      </div>
      {!active ? (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Der Link ist pausiert und nimmt keine neuen Empfehlungen an.
        </p>
      ) : null}
      {state.message ? (
        <p
          className={`text-sm ${state.error ? "text-red-700" : "text-emerald-700"}`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
