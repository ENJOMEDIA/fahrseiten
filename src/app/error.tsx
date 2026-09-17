"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6">
      <p className="font-semibold text-red-700">Fehler</p>
      <h1 className="mt-3 text-4xl font-semibold">Etwas ist schiefgelaufen</h1>
      <p className="mt-4 text-slate-600">
        Bitte versuche es erneut. Sensible Details werden nicht angezeigt.
      </p>
      <button
        className="mt-8 w-fit rounded-full bg-slate-950 px-5 py-3 text-white"
        onClick={reset}
        type="button"
      >
        Erneut versuchen
      </button>
    </main>
  );
}
