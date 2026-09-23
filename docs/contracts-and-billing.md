# Verträge und Abrechnungsverlauf

Stand: 23. September 2026. Accountable bleibt das führende System für die
Erstellung, Zustellung und steuerliche Archivierung wiederkehrender Rechnungen.
FahrSeiten bildet die operative Kundenakte ab und erzeugt selbst keine
steuerliche Rechnung.

## Angebote und Akten

Jeder Akquise-Kontakt besitzt von Beginn an eine Kundenakte mit Stammdaten,
Postanschrift, Wiedervorlage, Notizen, Briefvorgängen, Angeboten und
Aktivitätshistorie. Der Angebotsbearbeiter verwaltet frei beschreibbare
Positionen, Menge, Preis, Steuerbehandlung, Gültigkeit und Status. Optionale
Positionen wie Fotografie werden nur bei Bedarf ergänzt und können vollständig
entfernt werden. Er
erzeugt ein personalisiertes Angebots-PDF und kann den Stand als versendet,
angenommen oder abgelehnt dokumentieren. Eine Annahme setzt den Lead auf
`gewonnen`; die anschließende Instanzeinrichtung verknüpft dieselbe Lead-ID mit
der technischen Kundeninstanz.

Nach der Instanzeinrichtung ist die Fahrschule unter **Kundenakten** erreichbar.
Dort werden Akquise-Historie, Paket, Laufzeit, Rechnungsanschrift,
Rechnungskopien, Vertrags-PDFs und Signaturstatus gemeinsam dargestellt.

Je Mandant werden eine separate Rechnungsanschrift, Paketzuordnung,
Mindestlaufzeit, Abrechnungsrhythmus und der nächste erwartete Rechnungstermin
gespeichert. Die Rechnungsanschrift kann beim Einrichten aus dem Standort
übernommen oder getrennt erfasst werden. Plattform-Administratoren können eine
aus Accountable exportierte PDF-Kopie mit Rechnungsnummer, Datum,
Fälligkeit, Bruttobetrag und externer Referenz hinterlegen sowie den Status auf
offen, bezahlt, überfällig oder storniert setzen. Der Kunde sieht diese Angaben
unter **Vertrag & Rechnungen**; die Oberfläche weist ausdrücklich darauf hin,
dass die Rechnung separat zugestellt wird.

Monats- und Jahreszahlung werden getrennt von der Mindestvertragslaufzeit
gespeichert. Die Paketverwaltung kann die Jahreszahlung je Paket aktivieren und
einen Rabatt in Basispunkten festlegen. Bei der Zuweisung werden Monatswert,
tatsächlicher Rechnungsbetrag, Intervall und Rabatt als unveränderlicher
Vertrags-Snapshot gespeichert. So verändert eine spätere Preisanpassung keine
bereits vereinbarte Abrechnung. Der Kunde sieht Paketpreis pro Monat,
Rechnungsbetrag und Intervall getrennt. Das Onboarding zeigt die vorbereitete
Auswahl, verlangt eine Bestätigung und weist darauf hin, dass Angebot, Vertrag
und Accountable-Rechnung maßgeblich bleiben.

Die aktuelle B2B-Vertragslogik verwendet eine paketabhängige Mindestlaufzeit
von höchstens 24 Monaten. Eine ordentliche Kündigung ist in Textform mit einem
Monat Frist möglich, frühestens zum Ende der Mindestlaufzeit. Ohne Kündigung
läuft der Vertrag anschließend auf unbestimmte Zeit weiter und bleibt mit einem
Monat Frist zum Monatsende kündbar. Die Jahreszahlung ist ausdrücklich nur eine
Zahlungsweise. Endet der Vertrag während eines vorausbezahlten Zeitraums,
müssen volle Leistungsmonate nach dem Beendigungsdatum im führenden
Rechnungssystem gutgeschrieben werden. Der öffentlich gespeicherte AGB-Text
wird nicht automatisch überschrieben: Im Rechtsbereich erscheint bei einer
alten Fassung ein Hinweis zur bewussten Aktualisierung und Veröffentlichung.

## Empfehlungsbonus

Das **FahrSeiten Empfehlungsprogramm** arbeitet mit einem zufälligen Link je
aktivem Kunden. Der Kunde teilt ihn selbst und muss den möglichen Monatsbonus
offenlegen. FahrSeiten übernimmt keine Kontakte aus seinem Adressbuch und
versendet über diese Funktion keine Werbung an Dritte.

Eine Empfehlung wird erst freigegeben, wenn die empfohlene Instanz mindestens
30 Tage aktiv ist und ihre erste Rechnung als bezahlt dokumentiert wurde. Die
Bonushöhe wird zu diesem Zeitpunkt einmalig aus dem aktuellen monatlichen
Grundpreis des Werbers festgeschrieben. Es gibt keine Barauszahlung und keine
dauerhafte Preisänderung. Einrichtung, Zusatzmodule, Fotografie, Medien und
Porto werden nicht erfasst.

Die Plattform erstellt keine Gutschrift. Ein Plattform-Owner muss den Rabatt
zuerst auf einer konkreten Rechnung in Accountable berücksichtigen, die
Rechnungskopie in der Kundenakte hinterlegen und anschließend exakt diese
Rechnung auswählen. Eine Pflichtbestätigung und das Audit-Log dokumentieren
den manuellen Abgleich; stornierte Rechnungen sind gesperrt. Die öffentliche
Fassung `recommendation-v1` steht unter `/empfehlungsbedingungen`.

Neue Angebote verwenden standardmäßig die explizite Auswahl
**Kleinunternehmerregelung nach § 19 UStG**. In diesem Fall wird keine
Umsatzsteuerposition berechnet oder ausgewiesen; das PDF enthält stattdessen
den Hinweis „Umsatzsteuerbefreit nach § 19 UStG (Kleinunternehmerregelung). Es
wird keine Umsatzsteuer ausgewiesen.“ Wird die Auswahl bewusst deaktiviert,
kann ein Umsatzsteuersatz angegeben werden. Die Einstellung ist ein
kaufmännischer Snapshot je Angebot und ersetzt keine Prüfung des jeweils
geltenden Steuerstatus.

Rechnungskopien liegen im persistenten, nicht von Git verwalteten
Medienverzeichnis. Der Download prüft serverseitig Plattformberechtigung oder
aktive Mandantenzugehörigkeit. Beim endgültigen Löschen eines Mandanten wird
auch seine FahrSeiten-Kopie entfernt; gesetzlich aufzubewahrende Originale
bleiben im führenden Rechnungssystem.

Aus der Kundenakte kann ein A4-Vertragsmuster erzeugt werden. Es enthält
Parteien, Paket- und Preis-Snapshots, Beginn, Laufzeit, Abrechnung,
Mitwirkungspflichten, Rechte an Inhalten, Datenschutz, Wartung, Mängel und eine
abgestufte Haftungsregelung. Die Verantwortung des Kunden für bereitgestellte
oder freigegebene Inhalte hebt die eigene Verantwortung von FahrSeiten für
technische Leistungen und selbst erstellte Inhalte ausdrücklich nicht auf.

Das Vertrags-PDF und die allgemeinen B2B-AGB sind Arbeitsgrundlagen. Vor dem ersten
Vertragsschluss müssen Angebot, Leistungsbeschreibung, AGB,
Auftragsverarbeitungsvereinbarung, Kündigungslogik, Haftungsgrenze, Domain- und
Löschregelung gemeinsam anwaltlich geprüft und auf das tatsächliche
Geschäftsmodell abgestimmt werden. Die öffentliche AGB-Seite verwendet die
allgemeine Fassung, solange keine individuell geprüfte und versionierte Fassung
im Rechtsbereich veröffentlicht wurde.

Auch Empfehlungsbedingungen, Rabattdarstellung und steuerliche Behandlung des
Bonus müssen vor dem ersten produktiven Einsatz anwaltlich beziehungsweise mit
der Steuerberatung geprüft werden. Technische Sperren verhindern typische
Doppel- und Zuordnungsfehler, sind aber keine Rechts- oder Steuerberatung.

Das Vertrags-PDF verwendet das im Plattform-Medienbereich hinterlegte Logo. Das
Logo wird serverseitig in ein PDF-kompatibles PNG umgewandelt; fehlt es oder ist
es technisch nicht lesbar, erscheint als sichere Rückfallebene der Schriftzug
„FAHRSEITEN“.

## Elektronische Unterschrift

FahrSeiten soll Kundenakte, Vertragsdaten und Status eines Signaturvorgangs
verwalten, die eigentliche elektronische Signatur jedoch über einen
eIDAS-konformen Vertrauensdiensteanbieter ausführen. Eine selbst gebaute
Zeichenfläche für eine gemalte Unterschrift liefert allein keinen belastbaren
Identitäts-, Integritäts- oder Zeitnachweis.

Eine spätere Integration speichert Anbieter, externe Vorgangs-ID,
SHA-256-Prüfsumme des unveränderlichen Vertrags-PDFs, Unterzeichner, Status,
Zeitpunkte und Prüfprotokoll. Webhooks müssen kryptografisch geprüft und
idempotent verarbeitet werden. Vor der Auswahl sind Signaturniveau, EU-Hosting,
AVV, Unterauftragnehmer, API, Webhooks, Export des Prüfprotokolls, Kosten und
Löschfristen zu vergleichen. Ob für den konkreten FahrSeiten-Vertrag eine
einfache, fortgeschrittene oder qualifizierte elektronische Signatur benötigt
wird, ist rechtlich festzulegen.

Die technische Grundlage ist inzwischen vorhanden. Ein vorbereiteter Vertrag
wird als unveränderliche PDF-Datei im persistenten Medienverzeichnis abgelegt;
Vertragsnummer, Dateigröße und SHA-256-Prüfsumme werden in der Datenbank
gespeichert. Die Vertragsakte trennt Dokumente, Signaturvorgänge und
idempotente Anbieterereignisse. Sie kann Original, signierte Fassung und
Prüfprotokoll getrennt ausgeben. Plattformverwaltung und Kundenbereich prüfen
den Zugriff jeweils serverseitig über Plattformrecht beziehungsweise
Mandantenzugehörigkeit.

Der Anbieter wird hinter `SignatureProvider` gekapselt. Ein Adapter muss das
PDF übertragen, einen kurzlebigen Signatur-Link liefern, einen Vorgang
stornieren und signierte Webhooks prüfen können. Erst nach erfolgreicher
Webhook-Prüfung übernimmt FahrSeiten Status, signiertes PDF und Prüfprotokoll.
Solange kein Adapter gewählt ist, bleibt `SIGNATURE_PROVIDER=disabled`; der
Vertrag kann vorbereitet und heruntergeladen, aber nicht irreführend als
elektronisch signiert markiert werden. `SIGNATURE_LEVEL=advanced` beschreibt
den vorgesehenen Ausgangswert und wird bei der Anbieterauswahl rechtlich
bestätigt.

Auswahl und Kostenvergleich stehen in
[electronic-signatures.md](electronic-signatures.md).
