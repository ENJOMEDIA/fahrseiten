"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CONSENT_COOKIE,
  consentNoticeVersion,
  type ConsentChoices,
  type ConsentState,
  necessaryOnly,
  parseConsentCookie,
  serializeConsent,
} from "./model";
import type { OptionalService } from "./config";

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

export function ConsentManager({
  optionalServices,
}: {
  optionalServices: OptionalService[];
}) {
  const pathname = usePathname();
  const noticeVersion = consentNoticeVersion(optionalServices);
  const [visible, setVisible] = useState(false);
  const [choices, setChoices] = useState<ConsentChoices>({ ...necessaryOnly });

  useEffect(() => {
    queueMicrotask(() => {
      const current = readCookie();
      if (current?.version === noticeVersion) setChoices(current.choices);
      else setVisible(true);
    });
    const open = () => setVisible(true);
    window.addEventListener("fahrseiten:open-consent", open);
    return () => window.removeEventListener("fahrseiten:open-consent", open);
  }, [noticeVersion]);

  if (
    optionalServices.length === 0 ||
    hiddenPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    !visible
  )
    return null;

  async function save(nextChoices: typeof choices, withdrawn = false) {
    const state: ConsentState = {
      version: noticeVersion,
      choices: nextChoices,
      savedAt: new Date().toISOString(),
    };
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${CONSENT_COOKIE}=${serializeConsent(state)}; Path=/; Max-Age=15552000; SameSite=Lax${secure}`;
    window.dispatchEvent(new Event("fahrseiten:consent-changed"));
    setChoices(nextChoices);
    setVisible(false);
    await fetch("/api/consent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        subjectId: browserSubjectId(),
        noticeVersion,
        choices: nextChoices,
        withdrawn,
      }),
    }).catch(() => undefined);
  }

  return (
    <aside
      aria-label="Einwilligungseinstellungen"
      aria-modal="true"
      className="consent-enter fixed inset-x-3 bottom-3 z-50 mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/95 shadow-[0_28px_100px_rgba(15,23,42,.28)] backdrop-blur-2xl sm:inset-x-6 sm:bottom-6"
      role="dialog"
    >
      <div className="h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500" />
      <div className="p-5 sm:p-7">
        <p className="text-xs font-bold tracking-[.18em] text-cyan-700 uppercase">
          Du entscheidest
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Datenschutz nach deiner Wahl
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Notwendige Funktionen sind immer aktiv. Optionale Inhalte bleiben bis
          zu deiner Auswahl technisch blockiert. Details stehen im{" "}
          <Link className="underline" href="/datenschutz">
            Datenschutzhinweis
          </Link>
          .
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {optionalServices.map(({ category: key, label, services }) => (
            <label
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg"
              key={`${key}-${label}`}
            >
              <input
                checked={choices[key]}
                onChange={(event) =>
                  setChoices({ ...choices, [key]: event.currentTarget.checked })
                }
                className="mt-1 size-5 accent-cyan-600"
                type="checkbox"
              />
              <span>
                <span className="block font-semibold">{label}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {services}
                </span>
              </span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold transition hover:bg-slate-100"
            onClick={() => void save({ ...necessaryOnly }, true)}
          >
            Nur notwendige
          </button>
          <button
            className="rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            onClick={() => void save(choices)}
          >
            Auswahl speichern
          </button>
          <button
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            onClick={() =>
              void save({
                necessary: true,
                functional: optionalServices.some(
                  (item) => item.category === "functional",
                ),
                statistics: optionalServices.some(
                  (item) => item.category === "statistics",
                ),
                marketing: optionalServices.some(
                  (item) => item.category === "marketing",
                ),
              })
            }
          >
            Allen zustimmen
          </button>
        </div>
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
