import type { Metadata } from "next";

import { TenantOnboardingForm } from "@/components/setup/setup-form";
import { findTenantOnboardingPrefill } from "@/modules/setup/tenant-onboarding";

export const metadata: Metadata = {
  title: "Fahrschulseite einrichten",
  robots: { index: false, follow: false },
};

export default async function TenantOnboardingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const prefill = await findTenantOnboardingPrefill(token);
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-sm font-semibold text-cyan-700">
          Persönliche Instanzeinrichtung
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          Fahrschulseite vorbereiten
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          Lege die wichtigsten Angaben für deine Website fest. Alle Inhalte
          können anschließend im Kundenbereich ergänzt und bearbeitet werden.
        </p>
        <p className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-950">
          Anschrift und rechtliche Grundangaben gelten für diese
          Fahrschulinstanz. Nach der Einrichtung meldest du dich mit dem hier
          vergebenen Zugang an, prüfst unter „Rechtliches“ die Entwürfe für
          Impressum und Datenschutz und veröffentlichst sie erst nach deiner
          Freigabe.
        </p>
        <TenantOnboardingForm prefill={prefill ?? undefined} token={token} />
      </div>
    </main>
  );
}
