"use client";

import { useActionState, useId } from "react";

import { useAutoSave } from "@/components/forms/auto-save";
import type { FeatureKey } from "@/modules/features/catalog";

import {
  saveAddonAction,
  savePlanAction,
  type PricingActionState,
} from "./actions";

const initialState: PricingActionState = { message: "", error: false };

type FeatureOption = {
  key: FeatureKey;
  title: string;
  description: string;
  availability: "available" | "planned";
};

type EditablePlan = {
  id?: string;
  publicName: string;
  description: string | null;
  monthlyPriceCents: number | null;
  setupPriceCents: number | null;
  annualBillingEnabled: boolean;
  annualDiscountBasisPoints: number;
  minimumTermMonths: number;
  position: number;
  highlighted: boolean;
  active: boolean;
  includedFeatures: FeatureKey[];
};

function centsInput(value: number | null) {
  return value === null ? "" : (value / 100).toFixed(2).replace(".", ",");
}

export function PlanForm({
  plan,
  features,
}: {
  plan?: EditablePlan;
  features: FeatureOption[];
}) {
  const [state, action, pending] = useActionState(savePlanAction, initialState);
  const autoSaveFormId = useId();
  const autoSave = useAutoSave({
    enabled: Boolean(plan?.id),
    formId: autoSaveFormId,
    pending,
    result: state,
  });
  return (
    <form
      action={action}
      className="surface-lift rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
      id={autoSaveFormId}
      onChange={autoSave.onChange}
      onSubmit={autoSave.onSubmit}
    >
      {autoSave.indicator}
      {plan?.id ? <input name="id" type="hidden" value={plan.id} /> : null}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[.14em] text-cyan-700 uppercase">
            {plan?.id ? "Bestehendes Paket" : "Neues Paket"}
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {plan?.publicName || "Paket konfigurieren"}
          </h2>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            defaultChecked={plan?.active ?? true}
            name="active"
            type="checkbox"
          />{" "}
          Aktiv
        </label>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold sm:col-span-2">
          Öffentlicher Paketname
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            defaultValue={plan?.publicName}
            maxLength={120}
            name="publicName"
            required
          />
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Kurzbeschreibung
          <textarea
            className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 p-3 font-normal"
            defaultValue={plan?.description ?? ""}
            maxLength={1000}
            minLength={10}
            name="description"
            required
          />
        </label>
        <label className="text-sm font-semibold">
          Monatlich in Euro
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            defaultValue={centsInput(plan?.monthlyPriceCents ?? null)}
            inputMode="decimal"
            name="monthlyPrice"
            placeholder="z. B. 49,90"
          />
        </label>
        <label className="text-sm font-semibold">
          Einrichtung einmalig
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            defaultValue={centsInput(plan?.setupPriceCents ?? null)}
            inputMode="decimal"
            name="setupPrice"
            placeholder="z. B. 299,00"
          />
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold">
          <input
            defaultChecked={plan?.annualBillingEnabled ?? true}
            name="annualBillingEnabled"
            type="checkbox"
          />
          Jahreszahlung anbieten
        </label>
        <label className="text-sm font-semibold">
          Vorteil bei Jahreszahlung in Prozent
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            defaultValue={(plan?.annualDiscountBasisPoints ?? 1000) / 100}
            inputMode="decimal"
            max="50"
            min="0"
            name="annualDiscountPercent"
            step="0.01"
            type="number"
          />
          <span className="mt-1 block text-xs leading-5 font-normal text-slate-500">
            Der exakte Jahresbetrag wird bei Vertragszuordnung berechnet und
            unveränderlich gespeichert. Empfehlung: 10 %.
          </span>
        </label>
        <label className="text-sm font-semibold">
          Mindestlaufzeit in Monaten
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            defaultValue={plan?.minimumTermMonths ?? 1}
            max="24"
            min="1"
            name="minimumTermMonths"
            required
            type="number"
          />
          <span className="mt-1 block text-xs leading-5 font-normal text-slate-500">
            Danach läuft der Vertrag unbefristet weiter und ist mit einem Monat
            Frist zum Monatsende kündbar.
          </span>
        </label>
        <label className="text-sm font-semibold">
          Reihenfolge
          <select
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            defaultValue={plan?.position ?? 0}
            name="position"
          >
            <option value="0">1</option>
            <option value="1">2</option>
            <option value="2">3</option>
          </select>
        </label>
        <label className="flex items-center gap-2 self-end rounded-xl bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-950">
          <input
            defaultChecked={plan?.highlighted ?? false}
            name="highlighted"
            type="checkbox"
          />{" "}
          Als Empfehlung hervorheben
        </label>
      </div>
      <fieldset className="mt-6">
        <legend className="font-semibold">Im Paket enthalten</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {features.map((feature) => (
            <label
              className="flex gap-3 rounded-xl border border-slate-200 p-3 text-sm"
              key={feature.key}
            >
              <input
                defaultChecked={plan?.includedFeatures.includes(feature.key)}
                disabled={feature.availability === "planned"}
                name="includedFeatures"
                type="checkbox"
                value={feature.key}
              />
              <span>
                <strong className="block">{feature.title}</strong>
                {feature.availability === "planned" ? (
                  <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                    In Planung · noch nicht verkaufbar
                  </span>
                ) : null}
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {feature.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        className="premium-button mt-6 disabled:opacity-50"
        data-auto-save-submit
        disabled={pending}
        type="submit"
      >
        {pending ? "Speichert …" : "Paket speichern"}
      </button>
      {state.message ? (
        <p
          aria-live="polite"
          className={`mt-3 text-sm font-semibold ${state.error ? "text-red-700" : "text-emerald-700"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function AddonForm({
  feature,
}: {
  feature: FeatureOption & {
    addonAvailable: boolean;
    addonPriceCents: number | null;
  };
}) {
  const [state, action, pending] = useActionState(
    saveAddonAction,
    initialState,
  );
  const autoSaveFormId = useId();
  const autoSave = useAutoSave({
    enabled: feature.availability !== "planned",
    formId: autoSaveFormId,
    pending,
    result: state,
  });
  return (
    <form
      action={action}
      className="rounded-2xl border border-slate-200 bg-white p-4"
      id={autoSaveFormId}
      onChange={autoSave.onChange}
      onSubmit={autoSave.onSubmit}
    >
      {autoSave.indicator}
      <input name="featureKey" type="hidden" value={feature.key} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{feature.title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {feature.description}
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold">
          <input
            defaultChecked={feature.addonAvailable}
            disabled={feature.availability === "planned"}
            name="available"
            type="checkbox"
          />{" "}
          Zubuchbar
        </label>
      </div>
      <label className="mt-3 block text-xs font-semibold">
        Aufpreis monatlich
        <input
          className="mt-1 min-h-10 w-full rounded-xl border border-slate-300 px-3 font-normal"
          defaultValue={centsInput(feature.addonPriceCents)}
          disabled={feature.availability === "planned"}
          inputMode="decimal"
          name="price"
          placeholder="z. B. 9,90"
        />
      </label>
      <button
        className="mt-3 text-sm font-semibold text-cyan-800 disabled:opacity-50"
        data-auto-save-submit
        disabled={pending || feature.availability === "planned"}
        type="submit"
      >
        {pending ? "Speichert …" : "Modul speichern →"}
      </button>
      {state.message ? (
        <p
          aria-live="polite"
          className={`mt-2 text-xs ${state.error ? "text-red-700" : "text-emerald-700"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
