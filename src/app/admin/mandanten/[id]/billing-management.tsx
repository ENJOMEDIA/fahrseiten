"use client";

import { useActionState } from "react";

import {
  saveBillingProfileAction,
  saveBillingScheduleAction,
  uploadInvoiceAction,
  type DomainActionState,
} from "./actions";

const initialState: DomainActionState = { message: "", error: false };
const inputClass =
  "mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal";

function Feedback({ state }: { state: DomainActionState }) {
  return state.message ? (
    <p
      className={`mt-3 text-sm font-semibold ${state.error ? "text-red-700" : "text-emerald-700"}`}
    >
      {state.message}
    </p>
  ) : null;
}

export function BillingProfileForm({
  tenantId,
  profile,
}: {
  tenantId: string;
  profile: {
    useLocationAddress: boolean;
    companyName: string;
    recipientName: string | null;
    email: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
    vatId: string | null;
  } | null;
}) {
  const [state, action, pending] = useActionState(
    saveBillingProfileAction,
    initialState,
  );
  return (
    <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
      <input name="tenantId" type="hidden" value={tenantId} />
      <label className="flex items-center gap-3 text-sm font-semibold sm:col-span-2">
        <input
          defaultChecked={profile?.useLocationAddress ?? true}
          name="useLocationAddress"
          type="checkbox"
        />
        Rechnungsanschrift entspricht der Standortanschrift
      </label>
      <label className="text-sm font-semibold sm:col-span-2">
        Firma
        <input
          className={inputClass}
          defaultValue={profile?.companyName ?? ""}
          name="companyName"
          required
        />
      </label>
      <label className="text-sm font-semibold">
        Empfänger / Zusatz
        <input
          className={inputClass}
          defaultValue={profile?.recipientName ?? ""}
          name="recipientName"
        />
      </label>
      <label className="text-sm font-semibold">
        Rechnungs-E-Mail
        <input
          className={inputClass}
          defaultValue={profile?.email ?? ""}
          name="email"
          required
          type="email"
        />
      </label>
      <label className="text-sm font-semibold sm:col-span-2">
        Straße und Hausnummer
        <input
          className={inputClass}
          defaultValue={profile?.street ?? ""}
          name="street"
          required
        />
      </label>
      <label className="text-sm font-semibold">
        PLZ
        <input
          className={inputClass}
          defaultValue={profile?.postalCode ?? ""}
          name="postalCode"
          required
        />
      </label>
      <label className="text-sm font-semibold">
        Ort
        <input
          className={inputClass}
          defaultValue={profile?.city ?? ""}
          name="city"
          required
        />
      </label>
      <label className="text-sm font-semibold">
        Land
        <input
          className={inputClass}
          defaultValue={profile?.country ?? "Deutschland"}
          name="country"
          required
        />
      </label>
      <label className="text-sm font-semibold">
        USt-IdNr. (optional)
        <input
          className={inputClass}
          defaultValue={profile?.vatId ?? ""}
          name="vatId"
        />
      </label>
      <div className="sm:col-span-2">
        <button className="premium-button" disabled={pending}>
          {pending ? "Speichert …" : "Rechnungsanschrift speichern"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function BillingScheduleForm({
  tenantId,
  subscription,
}: {
  tenantId: string;
  subscription: {
    id: string;
    minimumTermMonths: number;
    billingIntervalMonths: number;
    nextInvoiceAt: Date | null;
  };
}) {
  const [state, action, pending] = useActionState(
    saveBillingScheduleAction,
    initialState,
  );
  return (
    <form action={action} className="mt-5 grid gap-4 sm:grid-cols-3">
      <input name="tenantId" type="hidden" value={tenantId} />
      <input name="subscriptionId" type="hidden" value={subscription.id} />
      <label className="text-sm font-semibold">
        Mindestlaufzeit (Monate)
        <input
          className={inputClass}
          defaultValue={subscription.minimumTermMonths}
          max="24"
          min="1"
          name="minimumTermMonths"
          required
          type="number"
        />
      </label>
      <label className="text-sm font-semibold">
        Zahlungsweise
        <select
          className={inputClass}
          defaultValue={subscription.billingIntervalMonths}
          name="billingIntervalMonths"
          required
        >
          <option value="1">Monatliche Abrechnung</option>
          <option value="12">Jahreszahlung</option>
        </select>
      </label>
      <label className="text-sm font-semibold">
        Nächste Rechnung
        <input
          className={inputClass}
          defaultValue={
            subscription.nextInvoiceAt?.toISOString().slice(0, 10) ?? ""
          }
          name="nextInvoiceAt"
          type="date"
        />
      </label>
      <div className="sm:col-span-3">
        <button className="premium-button" disabled={pending}>
          {pending ? "Speichert …" : "Laufzeit speichern"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function InvoiceUploadForm({ tenantId }: { tenantId: string }) {
  const [state, action, pending] = useActionState(
    uploadInvoiceAction,
    initialState,
  );
  return (
    <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
      <input name="tenantId" type="hidden" value={tenantId} />
      <label className="text-sm font-semibold">
        Rechnungsnummer
        <input className={inputClass} name="invoiceNumber" required />
      </label>
      <label className="text-sm font-semibold">
        Accountable-Referenz (optional)
        <input className={inputClass} name="externalReference" />
      </label>
      <label className="text-sm font-semibold">
        Rechnungsdatum
        <input className={inputClass} name="issuedAt" required type="date" />
      </label>
      <label className="text-sm font-semibold">
        Fällig am
        <input className={inputClass} name="dueAt" required type="date" />
      </label>
      <label className="text-sm font-semibold">
        Bruttobetrag in EUR
        <input
          className={inputClass}
          inputMode="decimal"
          name="grossAmount"
          placeholder="99,99"
          required
        />
      </label>
      <label className="text-sm font-semibold">
        Rechnungskopie (PDF, max. 10 MB)
        <input
          accept="application/pdf,.pdf"
          className={inputClass}
          name="invoice"
          required
          type="file"
        />
      </label>
      <div className="sm:col-span-2">
        <button className="premium-button" disabled={pending}>
          {pending ? "Lädt hoch …" : "Rechnung hinterlegen"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
