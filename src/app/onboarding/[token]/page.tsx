import type { Metadata } from "next";

import { TenantOnboardingForm } from "@/components/setup/setup-form";

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
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-sm font-semibold text-cyan-700">
          FahrSeiten-Onboarding
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          Fahrschulseite vorbereiten
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          Lege die wichtigsten Angaben für deine Website fest. Alle Inhalte
          können anschließend im Kundenbereich ergänzt und bearbeitet werden.
        </p>
        <TenantOnboardingForm token={token} />
      </div>
    </main>
  );
}
