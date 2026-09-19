"use client";

import { useState } from "react";
import Link from "next/link";

export function ConsultationForm() {
  const [startedAt] = useState(() => Date.now());
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  return (
    <form
      className="rounded-3xl border bg-white p-6 sm:p-8"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        setSending(true);
        const response = await fetch("/api/sales-lead", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            companyName: data.get("companyName"),
            contactName: data.get("contactName"),
            email: data.get("email"),
            phone: data.get("phone") || undefined,
            websiteUrl: data.get("websiteUrl") || undefined,
            message: data.get("message"),
            privacyAccepted: data.get("privacyAccepted") === "on",
            privacyTextVersion: "marketing-local-v1",
            website: data.get("website"),
            startedAt,
          }),
        });
        setSending(false);
        if (response.ok) {
          form.reset();
          setStatus(
            "Vielen Dank. Deine Anfrage ist bei FahrSeiten angekommen.",
          );
        } else
          setStatus(
            "Die Anfrage konnte nicht gespeichert werden. Bitte prüfe die Angaben.",
          );
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Fahrschule / Unternehmen
          <input
            className="mt-2 w-full rounded-xl border p-3"
            name="companyName"
            required
          />
        </label>
        <label className="text-sm font-semibold">
          Ansprechperson
          <input
            className="mt-2 w-full rounded-xl border p-3"
            name="contactName"
            required
          />
        </label>
        <label className="text-sm font-semibold">
          E-Mail
          <input
            className="mt-2 w-full rounded-xl border p-3"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="text-sm font-semibold">
          Telefon, optional
          <input className="mt-2 w-full rounded-xl border p-3" name="phone" />
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Bestehende Website, optional
          <input
            className="mt-2 w-full rounded-xl border p-3"
            name="websiteUrl"
            type="url"
          />
        </label>
      </div>
      <label className="mt-4 block text-sm font-semibold">
        Worum geht es?
        <textarea
          className="mt-2 min-h-32 w-full rounded-xl border p-3"
          name="message"
          required
        />
      </label>
      <label aria-hidden="true" className="sr-only">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>
      <label className="mt-4 flex gap-3 text-sm">
        <input
          className="mt-1"
          name="privacyAccepted"
          required
          type="checkbox"
        />
        <span>
          Ich habe die Hinweise zum Umgang mit meiner Anfrage in der{" "}
          <Link className="font-semibold underline" href="/datenschutz">
            Datenschutzerklärung
          </Link>{" "}
          zur Kenntnis genommen.
        </span>
      </label>
      <button
        className="mt-6 rounded-full bg-cyan-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
        disabled={sending}
      >
        {sending ? "Wird gespeichert …" : "Beratung anfragen"}
      </button>
      <p aria-live="polite" className="mt-4 font-semibold">
        {status}
      </p>
    </form>
  );
}
