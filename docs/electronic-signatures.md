# Elektronische Signaturen

Stand: 18. September 2026. Preise und Leistungsgrenzen müssen unmittelbar vor
Vertragsschluss erneut beim Anbieter geprüft werden.

## Zielbild

FahrSeiten führt den vollständigen Vertragsprozess in der eigenen Oberfläche.
Die Plattform erzeugt und versioniert das PDF, speichert seine Prüfsumme,
zeigt den Status in der Kundenakte und archiviert nach Abschluss die signierte
Fassung sowie das Prüfprotokoll. Ein externer Vertrauensdiensteanbieter
übernimmt Identifikation, Signatur, Zeitnachweis und kryptografisch geprüfte
Rückmeldungen.

Der Adapter muss mindestens bieten:

- REST-API mit kostenloser Sandbox;
- signierte und wiederholbare Webhooks;
- externe Unterzeichner ohne eigenes Anbieterkonto;
- Download von signiertem PDF und Prüfprotokoll;
- fortgeschrittene elektronische Signatur für den vorgesehenen B2B-Prozess;
- AVV, nachvollziehbare Unterauftragnehmer und EU-/EWR-Datenhaltung oder ein
  Land mit anerkanntem Angemessenheitsbeschluss und klar wählbarem Standort;
- transparente Löschfristen und Export nach Vertragsende;
- Rückkehr-URL oder eingebettete Signaturansicht für den FahrSeiten-Workflow.

## Vorauswahl

| Anbieter               | Test                                                                | Produktion und API                                                                                                                                                                                          | Einordnung für FahrSeiten                                                                                                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Skribble**           | Kostenloser Demo-API-Key; Pro 14 Tage testbar                       | API im Pro-Plan; laut Preisliste 36 Euro netto pro Nutzer und Monat bei jährlicher Abrechnung, 120 FES/QES pro Nutzer und Jahr, weitere FES 2 Euro; EES unbegrenzt. Branding kostet extra.                  | Derzeit stärkster Startkandidat: deutscher Auftritt, REST-API, EES/FES/QES und Speicherung in Deutschland oder der Schweiz. Vor Abschluss müssen eingebetteter Ablauf, Webhook-Signatur und das konkrete API-Kontingent schriftlich bestätigt werden. |
| **Yousign / Youtrust** | Trial und Sandbox; Trial-Webhooks nur in der Sandbox                | Produktions-API in Plus, Pro oder Scale; öffentliche API-Preise sind derzeit nicht verlässlich ausgewiesen. Signierte Webhooks, europäische Datenhaltung und White-Label werden angeboten.                  | Sehr passender EU-Kandidat, wenn ein schriftliches ISV-Angebot bei kleinem Volumen günstiger als Skribble ist. Preis, FES-Kosten und deutsche Vertragsunterlagen anfragen.                                                                            |
| **DocuSign Developer** | Kostenloses Entwicklerkonto ohne rechtsgültige Produktionsumschläge | Starter 50 Euro pro Monat für 40 SES-Umschläge; höhere Pläne 282 beziehungsweise 480 Euro monatlich. Eingebettetes Signieren und FES/QES liegen laut Vergleich erst in individuellen erweiterten Angeboten. | Technisch ausgereift, für den frühen FahrSeiten-Umfang voraussichtlich zu teuer. Sinnvoll bei stark wachsendem Volumen oder besonderem Enterprise-Bedarf.                                                                                             |

Ein dauerhaft kostenloser produktiver API-Dienst mit belastbarer FES,
Prüfprotokoll, Webhooks und AVV wurde nicht gefunden. Kostenlose Konten sind
für Entwicklung oder Tests gedacht. Für echte Verträge wird deshalb ein
bezahlter Tarif als Bestandteil der Einrichtungsleistung kalkuliert.

## Empfehlung

Zuerst wird mit einem kostenlosen Skribble-Demo-API-Key gegen den vorhandenen
Adaptervertrag entwickelt. Parallel wird ein Angebot von Skribble und Yousign
für zunächst 5 bis 20 Vertragsabschlüsse pro Monat eingeholt. Entscheidend ist
der Gesamtpreis für API, FES, Branding und Prüfprotokolle, nicht nur der
Nutzerpreis. DocuSign bleibt eine Ausweichoption, falls später Enterprise-
Anforderungen oder größere Volumina entstehen.

Vor der Produktivschaltung sind außerdem zu klären:

1. Reicht für den konkreten FahrSeiten-B2B-Vertrag eine FES aus?
2. Darf die Signaturansicht eingebettet werden oder erfolgt eine gebrandete
   Weiterleitung?
3. Welche Daten werden wie lange beim Anbieter gespeichert?
4. Welche Webhook-Signatur und Wiederholungsstrategie verwendet der Anbieter?
5. Wie werden Löschung, Anbieterwechsel und langfristige Beweisbarkeit
   vertraglich abgesichert?

## Herstellerinformationen

- [Skribble API](https://www.skribble.com/en-eu/electronic-signature-api/)
  und [Skribble Preise](https://www.skribble.com/de-de/preise/)
- [Yousign/Youtrust Webhooks](https://developers.youtrust.com/docs/subscription)
- [DocuSign Developer-Preise](https://ecom.docusign.com/de-DE/plans-and-pricing/developer)
- [EU-Kommission zu Signaturniveaus](https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/What%2Bis%2BeSignature)
