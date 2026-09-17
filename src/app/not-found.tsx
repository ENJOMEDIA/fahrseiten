import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6">
      <p className="font-semibold text-cyan-700">404</p>
      <h1 className="mt-3 text-4xl font-semibold">Seite nicht gefunden</h1>
      <p className="mt-4 text-slate-600">
        Die angeforderte Seite ist nicht verfügbar.
      </p>
      <Link
        className="mt-8 w-fit rounded-full bg-slate-950 px-5 py-3 text-white"
        href="/"
      >
        Zur Startseite
      </Link>
    </main>
  );
}
