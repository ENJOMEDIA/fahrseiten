"use client";

import { useActionState } from "react";

import {
  assignPlanAction,
  checkDomainAction,
  updateDomainAction,
  type DomainActionState,
} from "./actions";

const initialState: DomainActionState = { message: "", error: false };

function Feedback({ state }: { state: DomainActionState }) {
  return state.message ? (
    <p
      aria-live="polite"
      className={`mt-3 text-sm font-semibold ${state.error ? "text-amber-800" : "text-emerald-700"}`}
    >
      {state.message}
    </p>
  ) : null;
}

export function TenantPlanForm({
  tenantId,
  plans,
  currentPlanName,
}: {
  tenantId: string;
  plans: Array<{
    id: string;
    publicName: string;
    annualBillingEnabled: boolean;
    annualDiscountBasisPoints: number;
  }>;
  currentPlanName: string | null;
}) {
  const [state, action, pending] = useActionState(
    assignPlanAction,
    initialState,
  );
  return (
    <form action={action} className="mt-4">
      <input name="tenantId" type="hidden" value={tenantId} />
      <label className="text-sm font-semibold">
        Paket auswählen
        <select
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
          name="planId"
          required
        >
          <option value="">Bitte auswählen</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.publicName}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-3 block text-sm font-semibold">
        Zahlungsweise
        <select
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
          name="billingIntervalMonths"
          required
        >
          <option value="1">Monatliche Abrechnung</option>
          <option value="12">Jahreszahlung, sofern im Paket freigegeben</option>
        </select>
      </label>
      <button
        className="mt-3 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        disabled={pending || plans.length === 0}
        type="submit"
      >
        {pending
          ? "Weist zu …"
          : currentPlanName
            ? "Paket wechseln"
            : "Paket zuweisen"}
      </button>
      {plans.length === 0 ? (
        <p className="mt-2 text-xs text-amber-700">
          Lege zuerst unter „Pakete & Preise“ ein Paket an.
        </p>
      ) : null}
      <Feedback state={state} />
    </form>
  );
}

export function DomainManagement({
  tenantId,
  domainId,
  hostname,
  status,
  sslStatus,
}: {
  tenantId: string;
  domainId: string;
  hostname: string;
  status: string;
  sslStatus: string;
}) {
  const [updateState, updateAction, updatePending] = useActionState(
    updateDomainAction,
    initialState,
  );
  const [checkState, checkAction, checkPending] = useActionState(
    checkDomainAction,
    initialState,
  );
  return (
    <div className="mt-5 grid gap-3">
      <div className="grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
        <p>
          <span className="block text-xs text-slate-500">Domainstatus</span>
          <span className="font-semibold">{status}</span>
        </p>
        <p>
          <span className="block text-xs text-slate-500">SSL-Status</span>
          <span className="font-semibold">{sslStatus}</span>
        </p>
      </div>
      <form
        action={updateAction}
        className="grid gap-3 sm:grid-cols-[1fr_auto]"
      >
        <input name="tenantId" type="hidden" value={tenantId} />
        <input name="domainId" type="hidden" value={domainId} />
        <label className="text-sm font-semibold">
          Kundendomain
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            defaultValue={hostname}
            name="hostname"
            required
          />
        </label>
        <button
          className="self-end rounded-xl border border-slate-300 px-4 py-3 font-semibold disabled:opacity-50"
          disabled={updatePending}
          type="submit"
        >
          {updatePending ? "Speichert …" : "Domain ändern"}
        </button>
        <div className="sm:col-span-2">
          <Feedback state={updateState} />
        </div>
      </form>
      <form action={checkAction}>
        <input name="tenantId" type="hidden" value={tenantId} />
        <input name="domainId" type="hidden" value={domainId} />
        <button
          className="premium-button w-full disabled:opacity-50 sm:w-auto"
          disabled={checkPending}
          type="submit"
        >
          {checkPending
            ? "DNS und SSL werden geprüft …"
            : "DNS & SSL jetzt prüfen"}
        </button>
        <Feedback state={checkState} />
      </form>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-semibold">Zusätzlich in Plesk erforderlich</p>
        <p className="mt-1">
          Die Kundendomain muss als Domain-Alias beziehungsweise zusätzliche
          Domain auf dasselbe Hosting und denselben Node.js-Startpunkt wie
          fahrseiten.de gelegt werden. DNS allein leitet die Anfrage zwar zum
          Server, verbindet sie in Plesk aber noch nicht automatisch mit dieser
          Anwendung. Danach SSL für die Kundendomain ausstellen und hier erneut
          „DNS & SSL jetzt prüfen“ ausführen.
        </p>
      </div>
    </div>
  );
}
