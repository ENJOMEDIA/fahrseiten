import { SimpleMarketingPage } from "@/components/marketing/simple-page";
import { ConsultationForm } from "@/modules/sales/consultation-form";

export default function ContactPage() {
  return (
    <SimpleMarketingPage
      eyebrow="Persönliche Beratung"
      title="Erzähl uns kurz, wohin deine Fahrschule digital soll."
      text="Wir melden uns persönlich, klären den aktuellen Stand und machen die nächsten Schritte verständlich."
    >
      <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
        <aside className="rounded-[2rem] bg-slate-950 p-8 text-white sm:p-10">
          <p className="section-kicker text-cyan-300">So geht es weiter</p>
          <ol className="mt-8 space-y-7">
            {[
              [
                "01",
                "Anfrage senden",
                "Ein paar Angaben reichen für den Anfang.",
              ],
              [
                "02",
                "Kurz kennenlernen",
                "Wir sprechen über Ziele, Inhalte und deine Domain.",
              ],
              [
                "03",
                "Sauber einrichten",
                "Dein Zugang führt dich Schritt für Schritt durch den Start.",
              ],
            ].map(([number, title, text]) => (
              <li className="flex gap-4" key={number}>
                <span className="font-mono text-xs text-cyan-300">
                  {number}
                </span>
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-10 rounded-2xl bg-white/5 p-4 text-sm leading-6 text-slate-400">
            Deine Anfrage landet ausschließlich in der FahrSeiten-Akquise und
            wird keinem Fahrschulmandanten zugeordnet.
          </p>
        </aside>
        <ConsultationForm />
      </div>
    </SimpleMarketingPage>
  );
}
