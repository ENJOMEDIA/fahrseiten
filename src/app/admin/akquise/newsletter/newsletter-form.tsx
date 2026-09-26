"use client";

import { useActionState, useState } from "react";

import { queueNewsletterAction, type SalesActionState } from "../actions";

const initialState: SalesActionState = { message: "", error: false };

type Recipient = {
  id: string;
  companyName: string;
  contactName: string | null;
  email: string | null;
  permissionEvidence: string | null;
};

export function NewsletterForm({ recipients }: { recipients: Recipient[] }) {
  const [state, action, pending] = useActionState(
    queueNewsletterAction,
    initialState,
  );
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <form action={action} className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[.16em] text-cyan-700 uppercase">
              Empfängerliste
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Kontakte mit ausdrücklicher Einwilligung
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Bestandskunden-Ausnahmen und abgemeldete Kontakte werden hier
              bewusst nicht angeboten. Jede Nachricht enthält einen persönlichen
              Abmeldelink.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
              onClick={() => setSelected(recipients.map((item) => item.id))}
              type="button"
            >
              Alle auswählen
            </button>
            <button
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
              onClick={() => setSelected([])}
              type="button"
            >
              Auswahl leeren
            </button>
          </div>
        </div>
        {recipients.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {recipients.map((recipient) => (
              <label
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 has-checked:border-cyan-400 has-checked:bg-cyan-50"
                key={recipient.id}
              >
                <input
                  checked={selected.includes(recipient.id)}
                  className="mt-1 size-5 accent-cyan-700"
                  name="leadIds"
                  onChange={() => toggle(recipient.id)}
                  type="checkbox"
                  value={recipient.id}
                />
                <span className="min-w-0">
                  <span className="block font-semibold">
                    {recipient.companyName}
                  </span>
                  <span className="block truncate text-sm text-slate-600">
                    {recipient.contactName || "Fahrschul-Team"} ·{" "}
                    {recipient.email}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-emerald-700">
                    {recipient.permissionEvidence}
                  </span>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
            Es gibt noch keine Kontakte mit dokumentierter ausdrücklicher
            Newsletter-Einwilligung.
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="text-sm font-semibold">
            Interner Kampagnenname
            <input
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-normal"
              name="name"
              placeholder="Produktupdate Oktober"
              required
            />
          </label>
          <label className="text-sm font-semibold">
            Gestaltung
            <select
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-normal"
              defaultValue="cyan"
              name="styleKey"
            >
              <option value="cyan">FahrSeiten Cyan</option>
              <option value="midnight">Urban Night</option>
              <option value="sunrise">Warm Motion</option>
            </select>
          </label>
        </div>
        <label className="mt-5 block text-sm font-semibold">
          Betreff
          <input
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-normal"
            name="subjectTemplate"
            placeholder="Neu bei FahrSeiten: {{Fahrschule}} im Mittelpunkt"
            required
          />
        </label>
        <label className="mt-5 block text-sm font-semibold">
          Inhalt
          <textarea
            className="mt-2 min-h-72 w-full rounded-2xl border border-slate-300 p-4 leading-7 font-normal"
            defaultValue={
              "Guten Tag {{Ansprechpartner}},\n\nbei FahrSeiten gibt es Neuigkeiten, die den digitalen Fahrschulalltag einfacher machen.\n\nMehr erfahren und den aktuellen Stand ansehen: {{Beispiel-Webseite}}\n\nViele Grüße\nEnrico Vogt · ENJO MEDIA"
            }
            name="bodyTemplate"
            required
          />
          <span className="mt-2 block text-xs font-normal text-slate-500">
            Verfügbar: {"{{Fahrschule}}"}, {"{{Ansprechpartner}}"},{" "}
            {"{{Webseite}}"} und {"{{Beispiel-Webseite}}"}.
          </span>
        </label>
        <label className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <input
            className="mt-1 size-5 shrink-0 accent-cyan-700"
            name="newsletterPermissionConfirmed"
            required
            type="checkbox"
            value="yes"
          />
          <span>
            Ich habe geprüft, dass die dokumentierte ausdrückliche Einwilligung
            jedes ausgewählten Kontakts Newsletter und werbliche
            Produktinformationen von FahrSeiten umfasst.
          </span>
        </label>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            className="premium-button disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pending || selected.length === 0}
            type="submit"
          >
            {pending
              ? "Newsletter wird eingeplant …"
              : `Newsletter an ${selected.length} Empfänger einplanen`}
          </button>
          <p className="text-xs leading-5 text-slate-500">
            Der bestehende Cronjob übernimmt Versand, Wiederholungen und
            Fehlerstatus.
          </p>
        </div>
        {state.message ? (
          <p
            aria-live="polite"
            className={`mt-4 rounded-xl p-3 text-sm font-semibold ${state.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}
          >
            {state.message}
          </p>
        ) : null}
      </section>
    </form>
  );
}
