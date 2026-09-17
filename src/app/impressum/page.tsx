import { SimpleMarketingPage } from "@/components/marketing/simple-page";
export default function ImprintPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Rechtliches"
      title="Impressum"
      text="Redaktioneller Platzhalter – vor Veröffentlichung rechtlich und inhaltlich zu vervollständigen."
    >
      <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6">
        <h2 className="font-semibold">Noch nicht produktionsreif</h2>
        <p className="mt-3 text-slate-700">
          Unternehmensform, vertretungsberechtigte Person, vollständige
          Anschrift, Register- und Steuerangaben sowie Kontaktwege müssen durch
          ENJO MEDIA verbindlich geliefert und rechtlich geprüft werden.
        </p>
      </div>
    </SimpleMarketingPage>
  );
}
