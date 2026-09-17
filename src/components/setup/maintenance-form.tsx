"use client";

import Link from "next/link";
import { useActionState } from "react";

export type MaintenanceActionState = {
  message: string;
  error: boolean;
};

const initialState: MaintenanceActionState = { message: "", error: false };

export function MaintenanceForm({
  action: saveAction,
  maintenanceMode,
  maintenanceMessage,
  legalReady,
  legalHref,
  tenant = false,
}: {
  action: (
    state: MaintenanceActionState,
    formData: FormData,
  ) => Promise<MaintenanceActionState>;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  legalReady: boolean;
  legalHref: string;
  tenant?: boolean;
}) {
  const [state, action, pending] = useActionState(saveAction, initialState);

  return (
    <form
      action={action}
      className="max-w-2xl space-y-5 rounded-2xl border bg-white p-6"
    >
      {!legalReady ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Freischaltung noch gesperrt</p>
          <p className="mt-1 leading-6">
            Veröffentliche zuerst ein vollständiges Impressum und eine
            vollständige Datenschutzerklärung. Danach lässt sich der
            Wartungsmodus deaktivieren.
          </p>
          <Link
            className="mt-3 inline-flex font-semibold underline"
            href={legalHref}
          >
            Rechtliche Dokumente bearbeiten
          </Link>
        </div>
      ) : null}
      <label className="flex items-start gap-3 font-semibold">
        <input
          className="mt-1 size-5"
          defaultChecked={maintenanceMode}
          name="enabled"
          type="checkbox"
        />
        <span>
          Wartungsmodus aktiv
          <span className="mt-1 block text-sm font-normal text-slate-600">
            {tenant
              ? "Die Kundendomain zeigt eine Vorschauseite mit den hinterlegten Markenfarben."
              : "Die öffentliche Hauptseite und alle Marketing-Unterseiten zeigen die Vorschau. Administration, Installer und rechtliche Seiten bleiben erreichbar."}
          </span>
        </span>
      </label>
      <label className="block text-sm font-semibold">
        Vorschautext
        <textarea
          className="mt-2 min-h-32 w-full rounded-xl border p-3 font-normal"
          defaultValue={maintenanceMessage}
          maxLength={500}
          minLength={10}
          name="message"
          required
        />
      </label>
      <button
        className="rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Wird gespeichert …" : "Wartungsmodus speichern"}
      </button>
      {state.message ? (
        <p
          aria-live="polite"
          className={`text-sm font-semibold ${state.error ? "text-red-700" : "text-emerald-700"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
