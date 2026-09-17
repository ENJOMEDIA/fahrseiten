"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_COOKIE,
  type ConsentCategory,
  mayLoadOptional,
  parseConsentCookie,
} from "./model";

export function OptionalContent({
  category,
  title,
  children,
}: {
  category: ConsentCategory;
  title: string;
  children: React.ReactNode;
}) {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const refresh = () => {
      const raw = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`))
        ?.slice(CONSENT_COOKIE.length + 1);
      setAllowed(mayLoadOptional(parseConsentCookie(raw), category));
    };
    queueMicrotask(refresh);
    window.addEventListener("fahrseiten:consent-changed", refresh);
    return () =>
      window.removeEventListener("fahrseiten:consent-changed", refresh);
  }, [category]);
  if (allowed) return children;
  return (
    <div className="rounded-2xl border border-dashed border-slate-400 bg-slate-50 p-6">
      <p className="font-semibold">{title} ist blockiert</p>
      <p className="mt-2 text-sm text-slate-600">
        Dieser optionale Inhalt wird erst nach passender Einwilligung geladen.
      </p>
      <button
        className="mt-4 rounded-full border px-4 py-2 text-sm font-semibold"
        onClick={() =>
          window.dispatchEvent(new Event("fahrseiten:open-consent"))
        }
      >
        Einstellungen öffnen
      </button>
    </div>
  );
}
