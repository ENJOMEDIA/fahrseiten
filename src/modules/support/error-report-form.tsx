"use client";

import { useState } from "react";

export function ErrorReportForm({
  surface,
}: {
  surface: "marketing" | "customer_backend";
}) {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  return (
    <form
      className="rounded-3xl border bg-white p-8"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        setSending(true);
        const response = await fetch("/api/error-report", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            referenceId: data.get("referenceId") || undefined,
            summary: data.get("summary"),
            description: data.get("description"),
            website: data.get("website"),
            pagePath: window.location.pathname,
            browser: navigator.userAgent,
            surface,
          }),
        });
        const result = (await response.json()) as { referenceId?: string };
        setSending(false);
        if (response.ok) {
          form.reset();
          setStatus(`Gespeichert. Referenz-ID: ${result.referenceId}`);
        } else setStatus("Der Bericht konnte nicht gespeichert werden.");
      }}
    >
      <label className="block text-sm font-semibold">
        Referenz-ID, falls vorhanden
        <input
          className="mt-2 w-full rounded-xl border p-3"
          name="referenceId"
        />
      </label>
      <label className="mt-4 block text-sm font-semibold">
        Kurztitel
        <input
          className="mt-2 w-full rounded-xl border p-3"
          name="summary"
          required
        />
      </label>
      <label className="mt-4 block text-sm font-semibold">
        Beschreibung ohne Passwörter, Tokens oder personenbezogene Daten
        <textarea
          className="mt-2 min-h-40 w-full rounded-xl border p-3"
          name="description"
          required
        />
      </label>
      <label aria-hidden="true" className="sr-only">
        Website
        <input name="website" tabIndex={-1} />
      </label>
      <button
        className="mt-6 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white disabled:opacity-50"
        disabled={sending}
      >
        {sending ? "Wird gespeichert …" : "Fehlerbericht senden"}
      </button>
      <p aria-live="polite" className="mt-3 text-sm font-semibold">
        {status}
      </p>
    </form>
  );
}
