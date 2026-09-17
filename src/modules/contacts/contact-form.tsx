"use client";
import { useState } from "react";

export function DemoContactForm() {
  const [startedAt] = useState(() => Date.now());
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  return (
    <section className="bg-white px-6 py-20">
      <form
        className="mx-auto max-w-2xl rounded-3xl border border-slate-200 p-6 sm:p-8"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          setSending(true);
          setStatus("");
          const data = new FormData(form);
          const response = await fetch("/api/demo/contact", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              formId: "demo-contact-v1",
              contactName: data.get("contactName"),
              email: data.get("email"),
              phone: data.get("phone") || undefined,
              licenseInterest: data.get("licenseInterest") || undefined,
              message: data.get("message"),
              privacyTextVersion: "demo-v1",
              consent: data.get("consent") === "on",
              website: data.get("website"),
              startedAt,
              source: "demo_website",
            }),
          });
          setSending(false);
          if (response.ok) {
            form.reset();
            setStatus(
              "Vielen Dank. Deine fiktive Testanfrage wurde gespeichert.",
            );
          } else
            setStatus(
              "Die Anfrage konnte nicht gesendet werden. Bitte prüfe deine Angaben.",
            );
        }}
      >
        <h2 className="text-3xl font-semibold">Kontakt aufnehmen</h2>
        <p className="mt-3 text-slate-600">
          Nur für lokale Tests. Bitte keine echten Personen- oder Kundendaten
          eingeben.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Name
            <input
              className="mt-2 w-full rounded-xl border p-3"
              maxLength={160}
              name="contactName"
              required
            />
          </label>
          <label className="text-sm font-semibold">
            E-Mail
            <input
              className="mt-2 w-full rounded-xl border p-3"
              maxLength={254}
              name="email"
              required
              type="email"
            />
          </label>
          <label className="text-sm font-semibold">
            Telefon, optional
            <input
              className="mt-2 w-full rounded-xl border p-3"
              maxLength={40}
              name="phone"
            />
          </label>
          <label className="text-sm font-semibold">
            Interesse
            <select
              className="mt-2 w-full rounded-xl border p-3"
              name="licenseInterest"
            >
              <option value="">Bitte wählen</option>
              <option>Klasse B</option>
              <option>Klasse A</option>
            </select>
          </label>
        </div>
        <label className="mt-4 block text-sm font-semibold">
          Nachricht
          <textarea
            className="mt-2 min-h-32 w-full rounded-xl border p-3"
            maxLength={5000}
            minLength={5}
            name="message"
            required
          />
        </label>
        <label className="sr-only" aria-hidden="true">
          Website
          <input autoComplete="off" name="website" tabIndex={-1} />
        </label>
        <label className="mt-4 flex gap-3 text-sm">
          <input className="mt-1" name="consent" required type="checkbox" />
          <span>
            Ich habe den fiktiven Datenschutzhinweis Version demo-v1 gelesen und
            stimme der Verarbeitung dieser Testangaben zu.
          </span>
        </label>
        <button
          className="mt-6 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
          disabled={sending}
        >
          {sending ? "Wird gesendet …" : "Testanfrage senden"}
        </button>
        <p aria-live="polite" className="mt-4 font-semibold">
          {status}
        </p>
      </form>
    </section>
  );
}
