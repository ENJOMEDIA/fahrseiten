"use client";

import { useActionState } from "react";

import { createSalesOfferAction, type OfferActionState } from "./actions";

const initialState: OfferActionState = { message: "", error: false };

export function OfferEditor({
  leadId,
  presets,
}: {
  leadId: string;
  presets: { name: string; monthlyPrice: string; setupPrice: string }[];
}) {
  const [state, action, pending] = useActionState(
    createSalesOfferAction,
    initialState,
  );
  const rows = [
    presets[0]
      ? {
          description: `${presets[0].name} · Einrichtung`,
          price: presets[0].setupPrice,
        }
      : { description: "Einrichtung FahrSeiten", price: "" },
    presets[0]
      ? {
          description: `${presets[0].name} · erster Monat`,
          price: presets[0].monthlyPrice,
        }
      : { description: "Monatliche Plattformnutzung", price: "" },
    { description: "Fotografie- und Medienpaket", price: "" },
    { description: "Zusatzleistung", price: "" },
  ];
  return (
    <form action={action} className="mt-5 space-y-4">
      <input name="leadId" type="hidden" value={leadId} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold">
          Angebotstitel
          <input
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            defaultValue="FahrSeiten Website-Paket"
            name="title"
            required
          />
        </label>
        <label className="text-sm font-semibold">
          Gültig bis
          <input
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
            name="validUntil"
            required
            type="date"
          />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Einleitung
        <textarea
          className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 p-3 font-normal"
          defaultValue="Vielen Dank für Ihr Interesse an FahrSeiten. Gern bieten wir Ihnen folgende Leistungen für einen professionellen und einfach verwaltbaren Webauftritt an."
          name="introduction"
        />
      </label>
      <label className="block max-w-xs text-sm font-semibold">
        Umsatzsteuersatz in Prozent
        <input
          className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-normal"
          defaultValue="19"
          min="0"
          max="100"
          name="vatRate"
          step="0.01"
          type="number"
        />
      </label>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="p-3">Position</th>
              <th className="p-3">Menge</th>
              <th className="p-3">Einzelpreis netto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="p-3">
                  <input
                    className="min-h-10 w-full rounded-lg border border-slate-300 px-3"
                    defaultValue={row.description}
                    name="description"
                  />
                </td>
                <td className="p-3">
                  <input
                    className="min-h-10 w-20 rounded-lg border border-slate-300 px-3"
                    defaultValue="1"
                    min="1"
                    name="quantity"
                    type="number"
                  />
                </td>
                <td className="p-3">
                  <input
                    className="min-h-10 w-36 rounded-lg border border-slate-300 px-3"
                    defaultValue={row.price}
                    name="unitPrice"
                    placeholder="0,00"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs leading-5 text-slate-500">
        Leere Positionen werden übersprungen. Preise werden netto erfasst; der
        gewählte Umsatzsteuersatz wird im PDF separat ausgewiesen.
      </p>
      <button className="premium-button" disabled={pending} type="submit">
        {pending ? "Angebot wird erstellt …" : "Angebot erstellen"}
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
