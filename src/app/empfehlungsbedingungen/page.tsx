import { SimpleMarketingPage } from "@/components/marketing/simple-page";

export default function ReferralTermsPage() {
  return (
    <SimpleMarketingPage
      availableDuringMaintenance
      eyebrow="Transparent empfehlen"
      title="Bedingungen für das FahrSeiten Empfehlungsprogramm"
      text="Klare Regeln für Fahrschulen, die FahrSeiten aus eigener Überzeugung weiterempfehlen."
    >
      <article className="prose prose-slate max-w-none rounded-3xl border border-slate-200 bg-white p-7 sm:p-10">
        <p className="rounded-2xl bg-cyan-50 p-4 text-sm leading-6">
          <strong>
            Stand: 23. September 2026 · Version recommendation-v1.
          </strong>{" "}
          Das Programm richtet sich ausschließlich an bestehende gewerbliche
          FahrSeiten-Kunden. Es ist kein öffentliches Provisions- oder
          Beschäftigungsmodell.
        </p>
        <h2>1. Eigene, transparente Empfehlung</h2>
        <p>
          Der werbende Kunde entscheidet selbst, wem er seinen persönlichen Link
          oder QR-Code zeigt. FahrSeiten erhält über den Link keine Adressbücher
          und versendet im Namen des Kunden keine unaufgeforderten
          Werbenachrichten. Bei jeder Empfehlung muss der mögliche Vorteil offen
          genannt werden, etwa: „Ich kann bei erfolgreicher Empfehlung einen
          Monatsbonus erhalten.“
        </p>
        <h2>2. Wann ein Bonus entsteht</h2>
        <p>
          Ein Bonus entsteht erst, wenn die empfohlene Fahrschule über den
          persönlichen Link Interesse übermittelt, einen entgeltlichen
          FahrSeiten-Vertrag abschließt, ihre Instanz mindestens 30 Tage aktiv
          ist und die erste Rechnung nachweislich bezahlt wurde.
          Eigenempfehlungen, bereits bekannte oder schon laufend betreute
          Interessenten sowie missbräuchliche Mehrfachanmeldungen sind
          ausgeschlossen.
        </p>
        <h2>3. Höhe und Verwendung</h2>
        <p>
          Der Bonus entspricht dem zum Freigabezeitpunkt geltenden monatlichen
          Grundpreis des aktiven Pakets des werbenden Kunden. Er verändert den
          Vertragspreis nicht dauerhaft, wird nicht bar ausgezahlt und gilt
          nicht für Einrichtung, Zusatzmodule, Fotografie, Medienproduktion,
          Porto oder Drittanbieterleistungen. Mehrere wirksame Empfehlungen
          können mehrere Boni auslösen.
        </p>
        <h2>4. Abrechnung</h2>
        <p>
          ENJO MEDIA weist den Bonus auf einer konkreten, steuerlich
          maßgeblichen Rechnung aus dem eingesetzten Rechnungssystem aus. Die
          FahrSeiten-Anzeige dokumentiert Status und Zuordnung, ersetzt aber
          keine Rechnung oder Gutschrift. Ein Bonus darf nicht doppelt oder auf
          eine stornierte Rechnung angerechnet werden.
        </p>
        <h2>5. Prüfung, Missbrauch und Beendigung</h2>
        <p>
          ENJO MEDIA darf die Voraussetzungen anhand der Vertrags- und
          Zahlungshistorie prüfen und einen Bonus mit dokumentiertem Grund
          ablehnen, wenn die Voraussetzungen fehlen oder ein Missbrauch
          vorliegt. Bereits vollständig entstandene Boni bleiben bei einer
          späteren Einstellung des Programms unberührt. Der persönliche Link
          kann jederzeit pausiert werden.
        </p>
        <h2>6. Datenschutz</h2>
        <p>
          Für die Zuordnung werden Empfehlungskennung, beteiligte Kundenkonten,
          Status, Zeitpunkte, Vertrags- und Zahlungsnachweise sowie die
          zugeordnete Rechnungsnummer verarbeitet. Einzelheiten stehen in der
          Datenschutzerklärung. Der werbende Kunde sieht keine Kontaktdaten der
          empfohlenen Person.
        </p>
        <h2>7. Steuern</h2>
        <p>
          Der Empfänger ist selbst dafür verantwortlich, mögliche steuerliche
          oder buchhalterische Folgen des Vorteils mit seiner Beratung zu
          klären. Die Abrechnung durch ENJO MEDIA erfolgt nach den im Zeitpunkt
          der Rechnung geltenden steuerlichen Angaben.
        </p>
      </article>
    </SimpleMarketingPage>
  );
}
