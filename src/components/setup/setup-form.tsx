"use client";

import { useState } from "react";

import { Input } from "@/components/ui/field";

export function PlatformSetupForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setMessage("");
    const response = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const result = await response.json();
    setPending(false);
    setMessage(
      response.ok
        ? result.status === "already_installed"
          ? "FahrSeiten ist bereits eingerichtet. Du kannst dich anmelden."
          : "Installation abgeschlossen. Entferne jetzt INSTALL_TOKEN in Plesk und melde dich an."
        : (result.message ?? "Installation fehlgeschlagen."),
    );
  }

  return (
    <form action={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Input
          autoComplete="off"
          label="Installationscode"
          name="installToken"
          required
          type="password"
        />
      </div>
      <Input
        defaultValue="FahrSeiten"
        label="Markenname"
        name="brandName"
        required
      />
      <Input
        defaultValue="ENJO MEDIA"
        label="Unternehmen"
        name="companyName"
        required
      />
      <Input
        autoComplete="name"
        label="Inhaber / vertretungsberechtigte Person"
        name="ownerName"
        required
      />
      <Input
        autoComplete="email"
        label="Administrator-E-Mail"
        name="email"
        required
        type="email"
      />
      <Input
        autoComplete="new-password"
        label="Administrator-Passwort"
        minLength={12}
        name="password"
        required
        type="password"
      />
      <Input autoComplete="tel" label="Telefon (optional)" name="phone" />
      <Input
        autoComplete="street-address"
        label="Straße und Hausnummer"
        name="street"
        required
      />
      <Input
        autoComplete="postal-code"
        label="Postleitzahl"
        name="postalCode"
        required
      />
      <Input autoComplete="address-level2" label="Ort" name="city" required />
      <Input
        defaultValue="#0891b2"
        label="Primärfarbe"
        name="primaryColor"
        required
        type="color"
      />
      <Input
        defaultValue="#0f172a"
        label="Akzentfarbe"
        name="accentColor"
        required
        type="color"
      />
      <div className="sm:col-span-2">
        <button
          className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Installation läuft …" : "FahrSeiten einrichten"}
        </button>
        {message ? (
          <p aria-live="polite" className="mt-4 text-sm text-slate-700">
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

export function TenantOnboardingForm({ token }: { token: string }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setMessage("");
    const response = await fetch(
      `/api/onboarding/${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      },
    );
    const result = await response.json();
    setPending(false);
    setMessage(
      response.ok
        ? "Deine Fahrschulseite wurde angelegt. Die Domain wird vor der Freischaltung noch geprüft. Du kannst dich jetzt im Kundenbereich anmelden."
        : (result.message ?? "Onboarding fehlgeschlagen."),
    );
  }

  return (
    <form action={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
      <Input label="Name der Fahrschule" name="companyName" required />
      <Input
        autoComplete="name"
        label="Inhaber / Ansprechpartner"
        name="ownerName"
        required
      />
      <Input
        autoComplete="email"
        label="E-Mail-Adresse"
        name="ownerEmail"
        required
        type="email"
      />
      <Input
        autoComplete="new-password"
        label="Passwort für den Kundenbereich"
        minLength={12}
        name="ownerPassword"
        required
        type="password"
      />
      <Input
        autoComplete="street-address"
        label="Straße und Hausnummer"
        name="street"
        required
      />
      <Input
        autoComplete="postal-code"
        label="Postleitzahl"
        name="postalCode"
        required
      />
      <Input autoComplete="address-level2" label="Ort" name="city" required />
      <Input autoComplete="tel" label="Telefon (optional)" name="phone" />
      <div className="sm:col-span-2">
        <Input
          hint="Die Domain wird gespeichert, aber erst nach DNS- und SSL-Prüfung aktiviert."
          label="Gewünschte Domain"
          name="domain"
          placeholder="fahrschule-beispiel.de"
          required
        />
      </div>
      <Input
        defaultValue="#0891b2"
        label="Primärfarbe"
        name="primaryColor"
        required
        type="color"
      />
      <Input
        defaultValue="#0f172a"
        label="Akzentfarbe"
        name="accentColor"
        required
        type="color"
      />
      <div className="sm:col-span-2">
        <button
          className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending
            ? "Website wird eingerichtet …"
            : "Fahrschulseite einrichten"}
        </button>
        {message ? (
          <p aria-live="polite" className="mt-4 text-sm text-slate-700">
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
