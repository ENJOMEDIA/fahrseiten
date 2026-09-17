"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CONSENT_COOKIE,
  CONSENT_VERSION,
  type ConsentChoices,
  type ConsentState,
  necessaryOnly,
  parseConsentCookie,
  serializeConsent,
} from "./model";

const hiddenPrefixes = ["/admin", "/kunde", "/login", "/passwort-"];

function readCookie() {
  const value = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  return parseConsentCookie(value);
}

function browserSubjectId() {
  const key = "fs_consent_subject";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

export function ConsentManager() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [choices, setChoices] = useState<ConsentChoices>({ ...necessaryOnly });

  useEffect(() => {
    queueMicrotask(() => {
      const current = readCookie();
      if (current) setChoices(current.choices);
      else setVisible(true);
    });
    const open = () => setVisible(true);
    window.addEventListener("fahrseiten:open-consent", open);
    return () => window.removeEventListener("fahrseiten:open-consent", open);
  }, []);

  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix)) || !visible)
    return null;

  async function save(nextChoices: typeof choices, withdrawn = false) {
    const state: ConsentState = {
      version: CONSENT_VERSION,
      choices: nextChoices,
      savedAt: new Date().toISOString(),
    };
    document.cookie = `${CONSENT_COOKIE}=${serializeConsent(state)}; Path=/; Max-Age=15552000; SameSite=Lax`;
    window.dispatchEvent(new Event("fahrseiten:consent-changed"));
    setChoices(nextChoices);
    setVisible(false);
    await fetch("/api/consent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        subjectId: browserSubjectId(),
        noticeVersion: CONSENT_VERSION,
        choices: nextChoices,
        withdrawn,
      }),
    }).catch(() => undefined);
  }

  return (
    <aside
      aria-label="Einwilligungseinstellungen"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-3xl border border-slate-300 bg-white p-6 shadow-2xl"
    >
      <h2 className="text-xl font-semibold">Datenschutz-Einstellungen</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Notwendige Funktionen sind immer aktiv. Optionale Inhalte bleiben bis zu
        deiner Auswahl technisch blockiert. Details stehen im{" "}
        <Link className="underline" href="/datenschutz">
          vorläufigen Datenschutzhinweis
        </Link>
        .
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {(
          [
            ["functional", "Funktional"],
            ["statistics", "Statistik"],
            ["marketing", "Marketing"],
          ] as const
        ).map(([key, label]) => (
          <label
            className="flex items-center gap-2 rounded-xl border p-3"
            key={key}
          >
            <input
              checked={choices[key]}
              onChange={(event) =>
                setChoices({ ...choices, [key]: event.currentTarget.checked })
              }
              type="checkbox"
            />
            {label}
          </label>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          className="rounded-full border px-5 py-2 font-semibold"
          onClick={() => void save({ ...necessaryOnly }, true)}
        >
          Nur notwendige
        </button>
        <button
          className="rounded-full bg-cyan-600 px-5 py-2 font-semibold text-white"
          onClick={() => void save(choices)}
        >
          Auswahl speichern
        </button>
        <button
          className="rounded-full bg-slate-950 px-5 py-2 font-semibold text-white"
          onClick={() =>
            void save({
              necessary: true,
              functional: true,
              statistics: true,
              marketing: true,
            })
          }
        >
          Allen zustimmen
        </button>
      </div>
    </aside>
  );
}

export function OpenConsentSettingsButton() {
  return (
    <button
      className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white"
      onClick={() => window.dispatchEvent(new Event("fahrseiten:open-consent"))}
    >
      Auswahl öffnen oder widerrufen
    </button>
  );
}
