import Image from "next/image";
import Link from "next/link";

import { findPlatformLogoId } from "@/modules/media/repository";
import { mediaPublicUrl } from "@/modules/media/public-url";
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
  const [lead, logoId] = await Promise.all([
    findPostalCampaignLead(leadId, token),
    findPlatformLogoId(),
  ]);
  if (!lead)
    return (
      <main className="grid min-h-screen place-items-center bg-[#07111d] px-5 text-white">
        <section className="max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
          <p className="text-xs font-bold tracking-[.18em] text-cyan-300 uppercase">
            Persönlicher FahrSeiten-Link
          </p>
          <h1 className="mt-4 text-3xl font-semibold">
            Dieser Link ist unvollständig oder nicht mehr gültig.
          </h1>
          <p className="mt-4 leading-7 text-slate-300">
            Bitte scanne den QR-Code auf deinem aktuellen Schreiben erneut.
            Wurde der Brief bereits vor einer Systemaktualisierung erstellt,
            fordere bitte einen neuen persönlichen Link an.
          </p>
          <Link
            className="mt-7 inline-flex rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950"
            href="/kontakt"
          >
            Kontakt zu FahrSeiten
          </Link>
        </section>
      </main>
    );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111d] px-5 py-10 text-white sm:px-8 sm:py-16">
      <meta content="noindex, nofollow" name="robots" />
      <div className="hero-orb hero-orb-one" aria-hidden="true" />
      <div className="hero-orb hero-orb-two" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link
            className="flex items-center gap-3 font-semibold tracking-tight"
            href="/"
          >
            {logoId ? (
              <Image
                alt="FahrSeiten – by ENJO MEDIA"
                className="h-9 w-auto max-w-44 object-contain object-left brightness-0 invert"
                height={44}
                priority
                src={mediaPublicUrl(logoId)}
                width={190}
              />
            ) : (
              <>
                FahrSeiten{" "}
                <span className="text-xs text-slate-400">by ENJO MEDIA</span>
              </>
            )}
          </Link>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
            Persönlich für {lead.companyName}
          </span>
        </header>
        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1.05fr_.85fr] lg:gap-14">
          <section className="pt-5">
            <p className="text-sm font-bold tracking-[.2em] text-cyan-300 uppercase">
              Dein Webauftritt. Einfacher gedacht.
            </p>
            <h1 className="mt-5 text-5xl leading-[.94] font-semibold tracking-[-.055em] text-balance sm:text-7xl">
              Eure Fahrschule verdient mehr als irgendeine Website.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
              FahrSeiten macht aus Fahrzeugen, Klassen, Standorten und Kursen
              einen starken Webauftritt – zentral gepflegt und ohne
              Technikstress.
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
            <div className="mt-9 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.06] shadow-2xl shadow-cyan-950/30">
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
                <span className="size-2 rounded-full bg-cyan-300" />
                <span className="size-2 rounded-full bg-white/30" />
                <span className="size-2 rounded-full bg-white/15" />
                <span className="ml-2 text-[11px] text-slate-400">
                  fahrseiten.de · einfach verwalten
                </span>
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-[1.15fr_.85fr] sm:p-6">
                <div className="rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-300 to-blue-500 p-5 text-slate-950">
                  <p className="text-xs font-bold tracking-[.16em] uppercase">
                    Euer digitaler Auftritt
                  </p>
                  <p className="mt-4 text-2xl leading-tight font-semibold">
                    Inhalte ändern, bevor der Kaffee kalt wird.
                  </p>
                  <Link
                    className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
                    href="/demo"
                  >
                    Beispielseite ansehen →
                  </Link>
                </div>
                <div className="space-y-2">
                  {[
                    "Fahrzeuge zeigen",
                    "Kurse pflegen",
                    "Anfragen erhalten",
                  ].map((item, index) => (
                    <div
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm font-semibold"
                      key={item}
                    >
                      <span className="grid size-7 place-items-center rounded-full bg-cyan-300 text-xs text-slate-950">
                        {index + 1}
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section className="sticky top-8 rounded-[2rem] border border-white/20 bg-white p-6 text-slate-950 shadow-2xl shadow-black/40 sm:p-8">
            <p className="text-xs font-bold tracking-[.18em] text-cyan-700 uppercase">
              Mit einem Klick antworten
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Wie dürfen wir weitermachen?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Deine Auswahl wird direkt in unserem Akquise-System gespeichert.
              Du entscheidest selbst, ob und wie wir uns melden dürfen.
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
