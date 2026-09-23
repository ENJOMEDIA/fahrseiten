import { notFound } from "next/navigation";

import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { findPublicReferral } from "@/modules/referrals/service";
import { ConsultationForm } from "@/modules/sales/consultation-form";

export const metadata = {
  title: "Persönliche FahrSeiten-Empfehlung",
  robots: { index: false, follow: false },
};

export default async function ReferralLandingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const referral = await findPublicReferral(code).catch(() => null);
  if (!referral) notFound();

  return (
    <SimpleMarketingPage
      availableDuringMaintenance
      eyebrow="Persönliche Empfehlung"
      title="Eine Fahrschule aus dem FahrSeiten-Netzwerk empfiehlt uns weiter."
      text="Du erhältst dieselbe persönliche Beratung und dieselben transparenten Paketpreise – ohne Aufschlag durch die Empfehlung."
    >
      <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
        <aside className="rounded-[2rem] bg-slate-950 p-7 text-white sm:p-9">
          <p className="text-xs font-bold tracking-[.16em] text-cyan-300 uppercase">
            Offen erklärt
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Was die Empfehlung bedeutet
          </h2>
          <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
            <li>✓ Dein Angebot und deine Beratung bleiben unverändert.</li>
            <li>
              ✓ Der Empfehlende kann nach Vertragsschluss, 30 aktiven Tagen und
              deiner ersten dokumentierten Zahlung einen Monatsbonus erhalten.
            </li>
            <li>
              ✓ FahrSeiten übermittelt dem Empfehlenden keine persönlichen
              Kontaktdaten aus diesem Formular.
            </li>
            <li>✓ Deine Anfrage ist unverbindlich.</li>
          </ul>
          <a
            className="mt-7 inline-flex font-semibold text-cyan-300 underline"
            href="/empfehlungsbedingungen"
          >
            Vollständige Empfehlungsbedingungen
          </a>
        </aside>
        <ConsultationForm referralCode={referral.code} />
      </div>
    </SimpleMarketingPage>
  );
}
