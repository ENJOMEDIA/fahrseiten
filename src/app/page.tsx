import Link from "next/link";

import { MarketingHeader } from "@/components/layout/marketing-header";

export default function MarketingStartPage() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-5xl flex-col justify-center gap-8 px-6 py-16">
        <p className="text-sm font-semibold tracking-[0.2em] text-cyan-700 uppercase">
          FahrSeiten – by ENJO MEDIA
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
          Das technische Fundament steht bereit.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          Diese lokale Seite markiert den Marketing-Kontext. Produkttexte und
          vollständige Oberflächen folgen in den vorgesehenen Laufplanphasen.
        </p>
        <nav aria-label="Lokale Bereiche" className="flex flex-wrap gap-3">
          <Link
            className="rounded-full bg-slate-950 px-5 py-3 text-white"
            href="/admin"
          >
            Plattform-Admin
          </Link>
          <Link
            className="rounded-full border border-slate-300 px-5 py-3"
            href="/kunde"
          >
            Kunden-Admin
          </Link>
          <Link
            className="rounded-full border border-slate-300 px-5 py-3"
            href="/demo"
          >
            Tenant-Demo
          </Link>
        </nav>
      </main>
    </>
  );
}
