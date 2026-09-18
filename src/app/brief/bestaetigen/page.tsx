import Link from "next/link";

import { verifyPostalConfirmation } from "@/modules/platform/postal-campaign";
import { confirmPostalEmailAction } from "./actions";

export default async function PostalConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{
    lead?: string;
    token?: string;
    status?: string;
  }>;
}) {
  const query = await searchParams;
  const success = query.status === "success";
  const valid =
    !success &&
    query.lead &&
    query.token &&
    (await verifyPostalConfirmation(query.lead, query.token));
  const invalid = query.status === "invalid" || (!success && !valid);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 py-16">
      <meta content="noindex, nofollow" name="robots" />
      <article className="w-full max-w-xl rounded-[2rem] bg-white p-8 text-slate-950 shadow-2xl sm:p-10">
        <p className="text-xs font-bold tracking-[.18em] text-cyan-700 uppercase">
          FahrSeiten · ENJO MEDIA
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          {success
            ? "E-Mail-Adresse bestätigt"
            : invalid
              ? "Link nicht gültig"
              : "Fast geschafft"}
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          {success
            ? "Deine Informationen sind auf dem Weg. Wir melden uns außerdem persönlich bei dir."
            : invalid
              ? "Der Bestätigungslink ist unvollständig, bereits verwendet oder abgelaufen."
              : "Bestätige jetzt deine E-Mail-Adresse. Erst danach senden wir die gewünschten FahrSeiten-Informationen."}
        </p>
        {valid && query.lead && query.token ? (
          <form action={confirmPostalEmailAction} className="mt-7">
            <input name="lead" type="hidden" value={query.lead} />
            <input name="token" type="hidden" value={query.token} />
            <button className="w-full rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
              E-Mail-Adresse bestätigen
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
