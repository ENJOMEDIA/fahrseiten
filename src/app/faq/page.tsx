import { SimpleMarketingPage } from "@/components/marketing/simple-page";
const questions = [
  [
    "Ist FahrSeiten WordPress?",
    "Nein. FahrSeiten ist eine eigenentwickelte, zentrale SaaS-Plattform.",
  ],
  [
    "Braucht jede Fahrschule eine eigene Installation?",
    "Nein. Mandanten werden sicher innerhalb derselben Anwendung und Datenbank getrennt.",
  ],
  [
    "Kann eine eigene Domain genutzt werden?",
    "Ja, individuelle Domains sind vorgesehen. DNS und SSL werden kontrolliert angebunden.",
  ],
  [
    "Sind Fahrstundenplanung und Schülerverwaltung schon enthalten?",
    "Nein. Beide Funktionen liegen außerhalb des ersten MVP und sind als spätere Erweiterung dokumentiert.",
  ],
  [
    "Ist die Demo eine echte Fahrschule?",
    "Nein. Namen, Personen, Preise und Kontaktdaten sind vollständig fiktiv.",
  ],
] as const;
export default function FaqPage() {
  return (
    <SimpleMarketingPage
      eyebrow="FAQ"
      title="Klare Antworten zum aktuellen Produktstand."
      text="Was FahrSeiten heute vorbereitet, was im MVP enthalten ist und was später folgt."
    >
      <div className="divide-y rounded-3xl border bg-white px-6">
        {questions.map(([question, answer]) => (
          <details className="py-5" key={question}>
            <summary className="cursor-pointer font-semibold">
              {question}
            </summary>
            <p className="mt-3 leading-7 text-slate-600">{answer}</p>
          </details>
        ))}
      </div>
    </SimpleMarketingPage>
  );
}
