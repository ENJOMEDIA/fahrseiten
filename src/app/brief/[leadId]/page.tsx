import Link from "next/link";
import { notFound } from "next/navigation";

import { findPostalCampaignLead } from "@/modules/platform/postal-campaign";
import { PostalResponseForm } from "./response-form";

export default async function PostalCampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ leadId }, query] = await Promise.all([params, searchParams]);
  const token = query.token ?? "";
  const lead = await findPostalCampaignLead(leadId, token);
  if (!lead) notFound();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111d] px-5 py-10 text-white sm:px-8 sm:py-16">
      <meta content="noindex, nofollow" name="robots" />
      <div className="hero-orb hero-orb-one" aria-hidden="true" />
      <div className="hero-orb hero-orb-two" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <Link className="font-semibold tracking-tight" href="/">
            FahrSeiten{" "}
            <span className="text-xs text-slate-400">by ENJO MEDIA</span>
          </Link>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
            Persönlich für {lead.companyName}
          </span>
        </header>
        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[1fr_.9fr] lg:gap-16">
          <section className="pt-5">
            <p className="text-sm font-bold tracking-[.2em] text-cyan-300 uppercase">
              Dein Webauftritt. Einfacher gedacht.
            </p>
            <h1 className="mt-5 text-5xl leading-[.96] font-semibold tracking-[-.055em] text-balance sm:text-7xl">
              Weniger Website-Stress. Mehr Zeit für Fahrschule.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
              FahrSeiten verbindet Website, Inhalte, Fahrzeuge, Kurse und
              Anfragen in einer Oberfläche, die ohne Technikkenntnisse
              funktioniert.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Eigene Domain", "Einfach pflegen", "Persönlich begleitet"].map(
                (item) => (
                  <span
                    className="rounded-2xl border border-white/10 bg-white/[.06] px-4 py-4 text-sm font-semibold"
                    key={item}
                  >
                    ✓ {item}
                  </span>
                ),
              )}
            </div>
            <Link
              className="mt-8 inline-flex rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950"
              href="/demo"
            >
              Live-Demo entdecken →
            </Link>
          </section>
          <section className="rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl shadow-black/30 sm:p-8">
            <p className="text-xs font-bold tracking-[.18em] text-cyan-700 uppercase">
              Mit einem Klick antworten
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Wie dürfen wir weitermachen?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Deine Auswahl wird direkt in unserem Akquise-System gespeichert.
            </p>
            <div className="mt-7">
              {lead.response ? (
                <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-950">
                  <p className="font-semibold">Antwort bereits gespeichert</p>
                  <p className="mt-2 text-sm leading-6">
                    Danke für deine Rückmeldung. Eine erneute Auswahl ist über
                    diesen Link nicht möglich.
                  </p>
                </div>
              ) : (
                <PostalResponseForm leadId={lead.id} token={token} />
              )}
            </div>
          </section>
        </div>
        <footer className="mt-14 flex flex-wrap gap-5 border-t border-white/10 pt-7 text-xs text-slate-400">
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <Link href="/agb">AGB</Link>
        </footer>
      </div>
    </main>
  );
}
