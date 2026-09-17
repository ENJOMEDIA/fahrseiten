import type { Metadata } from "next";
import Link from "next/link";

import { PlatformSetupForm } from "@/components/setup/setup-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "FahrSeiten einrichten",
  robots: { index: false, follow: false },
};

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-sm font-semibold text-cyan-700">Erstinstallation</p>
        <h1 className="mt-2 text-3xl font-semibold">FahrSeiten einrichten</h1>
        <p className="mt-4 leading-7 text-slate-600">
          Dieser Assistent initialisiert die gemeinsame Datenbank, legt den
          ersten Plattform-Owner an und speichert die grundlegenden Anbieter-
          und Designangaben.
        </p>
        <PlatformSetupForm />
        <p className="mt-8 text-sm text-slate-500">
          Bereits eingerichtet?{" "}
          <Link className="font-semibold text-cyan-800" href="/login">
            Zur Anmeldung
          </Link>
        </p>
      </div>
    </main>
  );
}
