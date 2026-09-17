"use client";
import { useState } from "react";
export function ModuleEditor({
  singular,
  example,
}: {
  singular: string;
  example: string;
}) {
  const [items, setItems] = useState([example]);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_22rem]">
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold">Aktive Einträge</h2>
        {items.length ? (
          <ul className="mt-4 divide-y">
            {items.map((item, index) => (
              <li
                className="flex items-center justify-between gap-3 py-4"
                key={`${item}-${index}`}
              >
                <span>{item}</span>
                <div className="flex gap-2">
                  <button
                    className="rounded-lg border px-3 py-2"
                    onClick={() =>
                      setItems((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    Deaktivieren
                  </button>
                  <button
                    aria-label={`${item} nach oben`}
                    className="rounded-lg border px-3 py-2"
                    disabled={index === 0}
                    onClick={() =>
                      setItems((current) => {
                        const next = [...current];
                        [next[index - 1], next[index]] = [
                          next[index],
                          next[index - 1],
                        ];
                        return next;
                      })
                    }
                  >
                    ↑
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-slate-600">
            Noch keine aktiven Einträge. Lege rechts den ersten an.
          </p>
        )}
      </section>
      <form
        className="rounded-2xl border bg-white p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          setItems((current) => [...current, draft.trim()]);
          setDraft("");
          setMessage("Lokal gespeichert.");
        }}
      >
        <h2 className="font-semibold">{singular} anlegen</h2>
        <label className="mt-4 block text-sm font-semibold">
          Bezeichnung
          <input
            className="mt-2 w-full rounded-xl border p-3"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </label>
        <button className="mt-4 w-full rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white">
          Speichern
        </button>
        <p aria-live="polite" className="mt-3 text-sm">
          {message}
        </p>
      </form>
    </div>
  );
}
