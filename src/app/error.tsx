"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const referenceId = error.digest
    ? `FS-${error.digest.slice(0, 12)}`
    : "FS-UNBEKANNT";
  const reportUrl = `/fehler-melden?referenceId=${encodeURIComponent(referenceId)}&summary=${encodeURIComponent("Technischer Fehler auf FahrSeiten")}`;
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6">
      <p className="font-semibold text-red-700">Fehler</p>
      <h1 className="mt-3 text-4xl font-semibold">Etwas ist schiefgelaufen</h1>
      <p className="mt-4 text-slate-600">
        Bitte versuche es erneut. Sensible Details werden nicht angezeigt.
      </p>
      <p className="mt-3 font-mono text-sm text-slate-500">
        Referenz-ID: {referenceId}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          className="w-fit rounded-full bg-slate-950 px-5 py-3 text-white"
          onClick={reset}
          type="button"
        >
          Erneut versuchen
        </button>
        <Link
          className="w-fit rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-900"
          href={reportUrl}
        >
          Fehler direkt melden
        </Link>
      </div>
    </main>
  );
}
