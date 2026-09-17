"use client";

import { useState } from "react";
import { publicationWarnings } from "./documents";

const drafts = {
  imprint:
    "ENTWURF\nAnschrift: [verbindlich ergänzen]\nKontakt: [verbindlich ergänzen]\nVertretung: [verbindlich ergänzen]\nRegister und weitere Pflichtangaben: [rechtlich prüfen]",
  privacy:
    "ENTWURF\nVerantwortlich: [verbindlich ergänzen]\nRechtsgrundlage: [rechtlich prüfen]\nSpeicherdauer: [festlegen]\nBetroffenenrechte: [rechtlich prüfen]\nEmpfänger und Unterauftragnehmer: [ergänzen]",
};

export function LegalEditor() {
  const [type, setType] = useState<keyof typeof drafts>("imprint");
  const [content, setContent] = useState(drafts.imprint);
  const [message, setMessage] = useState("");
  const warnings = publicationWarnings(type, content);
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex flex-wrap gap-3">
        {(["imprint", "privacy"] as const).map((value) => (
          <button
            className="rounded-full border px-4 py-2 font-semibold"
            key={value}
            onClick={() => {
              setType(value);
              setContent(drafts[value]);
              setMessage("");
            }}
          >
            {value === "imprint" ? "Impressum" : "Datenschutz"}
          </button>
        ))}
      </div>
      <label className="mt-5 block font-semibold">
        Version 1 · Entwurf
        <textarea
          className="mt-2 min-h-64 w-full rounded-xl border p-4 font-normal"
          onChange={(event) => setContent(event.currentTarget.value)}
          value={content}
        />
      </label>
      <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
        <p className="font-semibold">Veröffentlichungswarnung</p>
        <p className="mt-1">
          Rechtstexte müssen vor Veröffentlichung fachlich und rechtlich geprüft
          werden. Die technische Prüfung ersetzt keine Rechtsberatung.
        </p>
        {warnings.map((warning) => (
          <p className="mt-1" key={warning}>
            {warning}
          </p>
        ))}
      </div>
      <button
        className="mt-4 rounded-full bg-slate-950 px-5 py-2 font-semibold text-white"
        onClick={() =>
          setMessage(
            "Lokaler Entwurf gespeichert. Keine Veröffentlichung ausgelöst.",
          )
        }
      >
        Entwurf lokal speichern
      </button>
      <p aria-live="polite" className="mt-3 text-sm font-semibold">
        {message}
      </p>
    </div>
  );
}
