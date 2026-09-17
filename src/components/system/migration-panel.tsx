"use client";

import { useActionState } from "react";

import type { MigrationActionState } from "@/app/admin/system/actions";

const initialState: MigrationActionState = { message: "", error: false };

export function MigrationPanel({
  action: runAction,
  status,
}: {
  action: (state: MigrationActionState) => Promise<MigrationActionState>;
  status: {
    status: "ready" | "pending" | "error" | "unknown";
    checkedAt: string | null;
    detail: string;
  };
}) {
  const [state, action, pending] = useActionState(runAction, initialState);
  const tone =
    status.status === "ready"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : status.status === "error"
        ? "border-red-200 bg-red-50 text-red-950"
        : "border-amber-200 bg-amber-50 text-amber-950";

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[.18em] text-cyan-700 uppercase">
          Datenbank
        </p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Schema & Migrationen</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Bei jedem Plesk-Start werden neue, versionierte Migrationen
              automatisch angewendet. Ein Fehler wird protokolliert, ohne den
              öffentlichen Webserver absichtlich abzuschalten.
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}
          >
            {status.status === "ready"
              ? "Schema aktuell"
              : status.status === "error"
                ? "Prüfung erforderlich"
                : status.status === "pending"
                  ? "Migration verfügbar"
                  : "Noch nicht geprüft"}
          </span>
        </div>
      </div>
      <div className="p-6 sm:p-8">
        <div className={`rounded-2xl border p-5 text-sm leading-6 ${tone}`}>
          <p className="font-semibold">Letzter Lauf</p>
          <p className="mt-1">{status.detail}</p>
          {status.checkedAt ? (
            <p className="mt-2 text-xs opacity-70">
              {new Intl.DateTimeFormat("de-DE", {
                dateStyle: "medium",
                timeStyle: "medium",
              }).format(new Date(status.checkedAt))}
            </p>
          ) : null}
        </div>
        <form action={action} className="mt-5">
          <button
            className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? "Migration läuft …" : "Schema jetzt aktualisieren"}
          </button>
        </form>
        {state.message ? (
          <p
            aria-live="polite"
            className={`mt-4 text-sm font-semibold ${state.error ? "text-red-700" : "text-emerald-700"}`}
          >
            {state.message}
          </p>
        ) : null}
        <p className="mt-5 max-w-3xl text-xs leading-5 text-slate-500">
          Vor strukturellen Produktionsmigrationen bleibt ein aktuelles
          Datenbankbackup erforderlich. Bei einem Konflikt werden keine
          Änderungen zurückgesetzt und keine Down-Migration ausgeführt.
        </p>
      </div>
    </section>
  );
}
