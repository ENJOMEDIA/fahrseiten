"use client";

import { useActionState } from "react";

import type { ContentModuleKey } from "@/modules/content/management";
import {
  createContentEntryAction,
  toggleContentEntryAction,
  type ContentActionState,
} from "./actions";

const initialState: ContentActionState = { message: "", error: false };

function Result({ state }: { state: ContentActionState }) {
  return state.message ? (
    <p
      aria-live="polite"
      className={`mt-3 text-xs font-semibold ${state.error ? "text-red-700" : "text-emerald-700"}`}
    >
      {state.message}
    </p>
  ) : null;
}

export function ContentEntryForm({
  module,
  singular,
}: {
  module: ContentModuleKey;
  singular: string;
}) {
  const [state, action, pending] = useActionState(
    createContentEntryAction,
    initialState,
  );
  return (
    <form
      action={action}
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <input name="module" type="hidden" value={module} />
      <h2 className="font-semibold">{singular} anlegen</h2>
      <div className="mt-4 space-y-3">
        <label className="block text-sm font-semibold">
          Bezeichnung
          <input
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            name="title"
            required
          />
        </label>
        {module === "fuehrerscheinklassen" ? (
          <>
            <label className="block text-sm font-semibold">
              Kürzel
              <input
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
                name="key"
                required
              />
            </label>
            <label className="block text-sm font-semibold">
              Mindestalter
              <input
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
                min="0"
                name="minimumAge"
                type="number"
              />
            </label>
          </>
        ) : null}
        {module === "team" ? (
          <>
            <label className="block text-sm font-semibold">
              Rolle
              <input
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
                name="role"
                required
              />
            </label>
            <label className="block text-sm font-semibold">
              Qualifikationen
              <input
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
                name="qualifications"
                placeholder="Mit Komma trennen"
              />
            </label>
          </>
        ) : null}
        {module === "fahrzeuge" ? (
          <>
            <label className="block text-sm font-semibold">
              Kategorie
              <input
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
                name="category"
                required
              />
            </label>
            <label className="block text-sm font-semibold">
              Getriebe
              <select
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
                name="transmission"
              >
                <option value="manual">Schaltung</option>
                <option value="automatic">Automatik</option>
              </select>
            </label>
          </>
        ) : null}
        {module === "standorte" ? (
          <>
            <label className="block text-sm font-semibold">
              Straße und Hausnummer
              <input
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
                name="street"
                required
              />
            </label>
            <div className="grid grid-cols-[7rem_1fr] gap-2">
              <label className="block text-sm font-semibold">
                PLZ
                <input
                  className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
                  name="postalCode"
                  required
                />
              </label>
              <label className="block text-sm font-semibold">
                Ort
                <input
                  className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
                  name="city"
                  required
                />
              </label>
            </div>
            <label className="block text-sm font-semibold">
              Telefon
              <input
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
                name="phone"
              />
            </label>
            <label className="block text-sm font-semibold">
              E-Mail
              <input
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
                name="email"
                type="email"
              />
            </label>
          </>
        ) : null}
        {module !== "standorte" ? (
          <label className="block text-sm font-semibold">
            Beschreibung
            <textarea
              className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 p-3 font-normal"
              name="description"
            />
          </label>
        ) : null}
      </div>
      <button
        className="mt-4 w-full rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? "Speichert …" : "Speichern"}
      </button>
      <Result state={state} />
    </form>
  );
}

export function EntryVisibilityForm({
  module,
  id,
  active,
}: {
  module: ContentModuleKey;
  id: string;
  active: boolean;
}) {
  const [state, action, pending] = useActionState(
    toggleContentEntryAction,
    initialState,
  );
  return (
    <form action={action}>
      <input name="module" type="hidden" value={module} />
      <input name="id" type="hidden" value={id} />
      <input name="active" type="hidden" value={String(!active)} />
      <button
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? "…" : active ? "Ausblenden" : "Aktivieren"}
      </button>
      <Result state={state} />
    </form>
  );
}
