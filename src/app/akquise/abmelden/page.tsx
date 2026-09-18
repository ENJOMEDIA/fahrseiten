import Link from "next/link";

import { verifySalesUnsubscribeToken } from "@/modules/platform/sales-unsubscribe";
import { unsubscribeAction } from "./actions";

export default async function SalesUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string; token?: string; status?: string }>;
}) {
  const query = await searchParams;
  const valid =
    query.lead &&
    query.token &&
    verifySalesUnsubscribeToken(query.lead, query.token);
  const success = query.status === "success";
  const invalid = query.status === "invalid" || (!success && !valid);
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 py-16 text-slate-950">
      <article className="w-full max-w-xl rounded-[2rem] bg-white p-7 shadow-2xl sm:p-10">
        <p className="text-sm font-bold tracking-[.18em] text-cyan-700 uppercase">
          FahrSeiten · ENJO MEDIA
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          {success
            ? "Abmeldung gespeichert"
            : invalid
              ? "Link nicht gültig"
              : "Keine weiteren Akquise-E-Mails"}
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          {success
            ? "Die Adresse wurde dauerhaft für weitere FahrSeiten-Akquise-E-Mails gesperrt."
            : invalid
              ? "Dieser Abmeldelink ist unvollständig oder ungültig. Antworte alternativ auf die E-Mail, damit wir die Adresse sperren können."
              : "Mit einem Klick wird die hinterlegte Adresse für weitere FahrSeiten-Akquise-E-Mails gesperrt."}
        </p>
        {!success && !invalid ? (
          <form action={unsubscribeAction} className="mt-7">
            <input name="lead" type="hidden" value={query.lead} />
            <input name="token" type="hidden" value={query.token} />
            <button className="w-full rounded-full bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800">
              Akquise-E-Mails abbestellen
            </button>
          </form>
        ) : null}
        <Link
          className="mt-6 inline-flex text-sm font-semibold text-cyan-800"
          href="/"
        >
          Zur FahrSeiten-Startseite →
        </Link>
      </article>
    </main>
  );
}
