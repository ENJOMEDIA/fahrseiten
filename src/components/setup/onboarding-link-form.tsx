"use client";

import { useState } from "react";

export function OnboardingLinkForm() {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");

  async function createLink() {
    setMessage("");
    const response = await fetch("/api/admin/onboarding", { method: "POST" });
    if (!response.ok) {
      setMessage("Der Onboarding-Link konnte nicht erstellt werden.");
      return;
    }
    const result = await response.json();
    setUrl(result.url);
    setMessage(
      "Der Einmal-Link ist sieben Tage gültig und wird nur jetzt vollständig angezeigt.",
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-semibold">Kunden-Onboarding starten</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Erzeuge einen einmal verwendbaren Link, über den die Fahrschule
        Stammdaten, Zugang und Design festlegt.
      </p>
      <button
        className="mt-5 rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white"
        onClick={createLink}
        type="button"
      >
        Einmal-Link erzeugen
      </button>
      {url ? (
        <input
          aria-label="Onboarding-Link"
          className="mt-4 w-full rounded-xl border border-slate-300 p-3"
          readOnly
          value={url}
        />
      ) : null}
      {message ? (
        <p aria-live="polite" className="mt-3 text-sm text-slate-600">
          {message}
        </p>
      ) : null}
    </div>
  );
}
