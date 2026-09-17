import Link from "next/link";
import { SimpleMarketingPage } from "@/components/marketing/simple-page";

const questions = [
  [
    "Muss ich technisch fit sein?",
    "Nein. Der Kundenbereich führt dich mit verständlichen Aufgaben durch Inhalte, Bilder, Farben, Domain und Freigabe.",
  ],
  [
    "Ist FahrSeiten WordPress?",
    "Nein. FahrSeiten ist eine eigenentwickelte, zentrale Plattform für Fahrschulen.",
  ],
  [
    "Braucht jede Fahrschule eine eigene Installation?",
    "Nein. Alle Fahrschulen nutzen dieselbe gepflegte Anwendung. Daten bleiben durch den serverseitig geprüften Mandanten-Kontext getrennt.",
  ],
  [
    "Kann ich meine eigene Domain nutzen?",
    "Ja. Deine Domain wird nach DNS- und SSL-Prüfung mit deiner Website verbunden.",
  ],
  [
    "Kann ich Logo, Farben und Inhalte selbst ändern?",
    "Ja. Im Kundenbereich verwaltest du Logo, Bilder, Farben und strukturierte Inhaltsblöcke, ohne Code anzufassen.",
  ],
  [
    "Sind Fahrstundenplanung und Schülerverwaltung enthalten?",
    "Noch nicht. Diese Bereiche sind geplante Erweiterungen und werden klar als solche gekennzeichnet.",
  ],
] as const;

export default function FaqPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Fragen & Antworten"
      title="Verständlich erklärt. Ohne Techniksprech."
      text="Die wichtigsten Antworten zur Einrichtung, Verwaltung und Weiterentwicklung deiner Fahrschulwebsite."
    >
      <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
        <aside className="h-fit rounded-[2rem] bg-cyan-50 p-8 lg:sticky lg:top-28">
          <p className="section-kicker">Noch etwas offen?</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Wir schauen gemeinsam drauf.
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Eine kurze Nachricht reicht. Wir ordnen ein, was du wirklich
            brauchst.
          </p>
          <Link
            className="mt-7 inline-flex rounded-full bg-slate-950 px-5 py-3 font-semibold text-white"
            href="/kontakt"
          >
            Frage stellen
          </Link>
        </aside>
        <div className="space-y-3">
          {questions.map(([question, answer], index) => (
            <details
              className="group reveal-up rounded-2xl border border-slate-200 bg-white px-6 py-5 open:shadow-lg open:shadow-slate-900/5"
              key={question}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-semibold">
                <span>
                  <span className="mr-3 font-mono text-xs text-cyan-700">
                    0{index + 1}
                  </span>
                  {question}
                </span>
                <span className="text-2xl font-light transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-2xl pl-8 leading-7 text-slate-600">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </SimpleMarketingPage>
  );
}
