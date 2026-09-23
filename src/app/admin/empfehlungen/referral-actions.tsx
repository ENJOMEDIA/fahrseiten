"use client";

import { useActionState } from "react";

import {
  creditReferralAction,
  qualifyReferralAction,
  rejectReferralAction,
  type AdminReferralState,
} from "./actions";

const initial: AdminReferralState = { message: "", error: false };
type InvoiceOption = {
  id: string;
  invoiceNumber: string;
  grossAmountCents: number;
  issuedAt: Date;
};

function Message({ state }: { state: AdminReferralState }) {
  return state.message ? (
    <p
      aria-live="polite"
      className={`mt-2 text-xs ${state.error ? "text-red-700" : "text-emerald-700"}`}
    >
      {state.message}
    </p>
  ) : null;
}

export function ReferralActions({
  referralId,
  status,
  invoices,
}: {
  referralId: string;
  status: string;
  invoices: InvoiceOption[];
}) {
  const [qualifyState, qualify, qualifyPending] = useActionState(
    qualifyReferralAction,
    initial,
  );
  const [rejectState, reject, rejectPending] = useActionState(
    rejectReferralAction,
    initial,
  );
  const [creditState, credit, creditPending] = useActionState(
    creditReferralAction,
    initial,
  );
  if (["credited", "rejected", "cancelled"].includes(status)) return null;
  return (
    <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
      {status === "awaiting_eligibility" ? (
        <form action={qualify}>
          <input name="referralId" type="hidden" value={referralId} />
          <button
            className="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            disabled={qualifyPending}
          >
            {qualifyPending
              ? "Prüfung läuft …"
              : "Voraussetzungen prüfen & Bonus freigeben"}
          </button>
          <Message state={qualifyState} />
        </form>
      ) : null}
      {status === "qualified" ? (
        <form
          action={credit}
          className="rounded-xl border border-amber-300 bg-amber-50 p-4"
        >
          <input name="referralId" type="hidden" value={referralId} />
          <label className="block text-xs font-semibold">
            Accountable-Rechnung des Werbers
            <select
              className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3"
              name="invoiceId"
              required
              defaultValue=""
            >
              <option disabled value="">
                Rechnung auswählen
              </option>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoiceNumber} ·{" "}
                  {(invoice.grossAmountCents / 100).toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 flex items-start gap-2 text-xs leading-5">
            <input
              className="mt-1"
              name="accountableConfirmed"
              required
              type="checkbox"
            />
            <span>
              Ich habe den Bonus auf genau dieser Accountable-Rechnung abgezogen
              und Betrag, Steuerhinweis sowie Rechnungsempfänger geprüft.
            </span>
          </label>
          <button
            className="mt-3 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            disabled={creditPending || !invoices.length}
          >
            {creditPending
              ? "Wird zugeordnet …"
              : "Verrechnung endgültig dokumentieren"}
          </button>
          {!invoices.length ? (
            <p className="mt-2 text-xs text-amber-900">
              Zuerst eine Rechnungskopie in der Kundenakte hinterlegen.
            </p>
          ) : null}
          <Message state={creditState} />
        </form>
      ) : null}
      {["pending", "awaiting_eligibility"].includes(status) ? (
        <form action={reject} className="flex flex-col gap-2 sm:flex-row">
          <input name="referralId" type="hidden" value={referralId} />
          <input
            className="min-h-10 flex-1 rounded-lg border border-slate-300 px-3 text-xs"
            name="reason"
            minLength={5}
            placeholder="Prüfbarer Ablehnungsgrund"
            required
          />
          <button
            className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-800 disabled:opacity-60"
            disabled={rejectPending}
          >
            Ablehnen
          </button>
          <Message state={rejectState} />
        </form>
      ) : null}
    </div>
  );
}
