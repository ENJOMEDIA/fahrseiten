"use client";

import { useActionState, useState } from "react";

import { createSalesOfferAction, type OfferActionState } from "./actions";

const initialState: OfferActionState = { message: "", error: false };

type OfferRow = {
  id: number;
  description: string;
  price: string;
};

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
  const [smallBusinessExempt, setSmallBusinessExempt] = useState(true);
  const [nextId, setNextId] = useState(3);
  const [rows, setRows] = useState<OfferRow[]>([
    presets[0]
      ? {
          id: 1,
          description: `${presets[0].name} · Einrichtung`,
          price: presets[0].setupPrice,
        }
      : { id: 1, description: "Einrichtung FahrSeiten", price: "" },
    presets[0]
      ? {
          id: 2,
          description: `${presets[0].name} · erster Monat`,
          price: presets[0].monthlyPrice,
        }
      : { id: 2, description: "Monatliche Plattformnutzung", price: "" },
  ]);

  function addRow(description = "") {
    setRows((current) => [...current, { id: nextId, description, price: "" }]);
    setNextId((value) => value + 1);
  }

  function updateRow(id: number, patch: Partial<OfferRow>) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

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
          defaultValue="Vielen Dank für Ihr Interesse an FahrSeiten. Gern bieten wir Ihnen die folgenden Leistungen für einen modernen, schnell pflegbaren und persönlich begleiteten Webauftritt an."
          name="introduction"
        />
      </label>
      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
        <label className="flex items-start gap-3 text-sm font-semibold text-cyan-950">
          <input
            checked={smallBusinessExempt}
            className="mt-1"
            name="smallBusinessExempt"
            onChange={(event) => setSmallBusinessExempt(event.target.checked)}
            type="checkbox"
            value="yes"
          />
          <span>
            Kleinunternehmerregelung nach § 19 UStG anwenden
            <span className="mt-1 block leading-5 font-normal text-cyan-900">
              Standardmäßig aktiv. Im Angebot wird keine Umsatzsteuer
              ausgewiesen und der gesetzliche Hinweis ergänzt.
            </span>
          </span>
        </label>
        {!smallBusinessExempt ? (
          <label className="mt-4 block max-w-xs text-sm font-semibold">
            Umsatzsteuersatz in Prozent
            <input
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal"
              defaultValue="19"
              min="0"
              max="100"
              name="vatRate"
              step="0.01"
              type="number"
            />
          </label>
        ) : (
          <input name="vatRate" type="hidden" value="0" />
        )}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="mobile-stack-table w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="p-3">Position</th>
              <th className="p-3">Menge</th>
              <th className="p-3">Einzelpreis</th>
              <th className="p-3">
                <span className="sr-only">Aktion</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="p-3" data-label="Position">
                  <input
                    className="min-h-10 w-full rounded-lg border border-slate-300 px-3"
                    name="description"
                    onChange={(event) =>
                      updateRow(row.id, { description: event.target.value })
                    }
                    value={row.description}
                  />
                </td>
                <td className="p-3" data-label="Menge">
                  <input
                    className="min-h-10 w-20 rounded-lg border border-slate-300 px-3"
                    defaultValue="1"
                    min="1"
                    name="quantity"
                    type="number"
                  />
                </td>
                <td className="p-3" data-label="Einzelpreis">
                  <input
                    className="min-h-10 w-36 rounded-lg border border-slate-300 px-3"
                    name="unitPrice"
                    onChange={(event) =>
                      updateRow(row.id, { price: event.target.value })
                    }
                    placeholder="0,00"
                    value={row.price}
                  />
                </td>
                <td className="p-3 text-right" data-label="Aktion">
                  <button
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                    onClick={() =>
                      setRows((current) =>
                        current.filter((item) => item.id !== row.id),
                      )
                    }
                    type="button"
                  >
                    Entfernen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"
          onClick={() => addRow()}
          type="button"
        >
          + Freie Position
        </button>
        <button
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"
          onClick={() => addRow("Fotografie- und Medienpaket")}
          type="button"
        >
          + Fotografie
        </button>
      </div>
      <p className="text-xs leading-5 text-slate-500">
        Nur vorhandene Positionen werden übernommen. Fotografie und andere
        Zusatzleistungen lassen sich bei Bedarf mit einem Klick ergänzen oder
        vollständig entfernen.
      </p>
      <button
        className="premium-button"
        disabled={pending || rows.length === 0}
        type="submit"
      >
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
