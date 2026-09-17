import { SimpleMarketingPage } from "@/components/marketing/simple-page";
export default function ReportErrorPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Hilfe"
      title="Fehler melden"
      text="Beschreibe einen technischen Fehler ohne Passwörter, Zugangsdaten oder personenbezogene Inhalte."
    >
      <form className="rounded-3xl border bg-white p-8">
        <label className="block text-sm font-semibold">
          Referenz-ID, falls vorhanden
          <input className="mt-2 w-full rounded-xl border p-3" />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Beschreibung
          <textarea className="mt-2 min-h-40 w-full rounded-xl border p-3" />
        </label>
        <button
          className="mt-6 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white"
          type="button"
        >
          Lokalen Entwurf prüfen
        </button>
        <p className="mt-3 text-sm text-slate-500">
          Die persistente Fehlerübermittlung folgt in Schritt 18.
        </p>
      </form>
    </SimpleMarketingPage>
  );
}
