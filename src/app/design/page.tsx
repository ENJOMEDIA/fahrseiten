import Link from "next/link";
import { SimpleMarketingPage } from "@/components/marketing/simple-page";
export default function DesignPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Design & Demo"
      title="Ruhig, klar und auf jedem Gerät verständlich."
      text="Das Designsystem setzt auf gute Lesbarkeit, sichtbare Fokuszustände, reduzierte Bewegung und kontrollierte Varianten."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-slate-950 p-8 text-white">
          <p className="text-sm text-cyan-300">Fiktive Website-Demo</p>
          <h2 className="mt-3 text-3xl font-semibold">Fahrschule Morgenrot</h2>
          <p className="mt-4 text-slate-300">
            Alle Namen, Preise und Aussagen dienen ausschließlich der
            Produktprüfung.
          </p>
          <Link
            className="mt-7 inline-flex rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
            href="/demo"
          >
            Demo öffnen
          </Link>
        </div>
        <div className="rounded-3xl border p-8">
          <h2 className="text-2xl font-semibold">
            Kontrolliert statt beliebig
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Redaktionen wählen sichere Blöcke, feste Vorschaugrößen und
            freigegebene Theme-Optionen. Freies HTML, CSS oder JavaScript ist
            ausgeschlossen.
          </p>
          <Link
            className="mt-6 inline-block font-semibold text-cyan-800"
            href="/designsystem"
          >
            Interne Komponentenübersicht
          </Link>
        </div>
      </div>
    </SimpleMarketingPage>
  );
}
