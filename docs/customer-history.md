# Kundenakte und durchgängige Historie

Stand: 18. September 2026.

## Identitäten

FahrSeiten verwendet drei getrennte, stabile Kennungen:

| Kennung      | Zweck                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------- |
| Lead-ID      | Ursprung der Akquise; verbindet Brief-Link, QR-Code, Rückmeldungen, Einwilligungen und Aktivitäten |
| Kundennummer | Lesbare kaufmännische Referenz im Format `FS-XXXXXXXXXXXX`                                         |
| Tenant-ID    | Technische Mandantentrennung für Website, Benutzer, Inhalte, Medien und Domains                    |

Die Lead-ID wird beim Erstellen eines Einrichtungslinks ausdrücklich im Onboarding-Datensatz gespeichert. Beim Abschluss wird ausschließlich dieser Lead mit der neuen Tenant-ID verbunden. Eine Zuordnung allein über gleiche E-Mail-Adressen findet nicht mehr statt.

Die Kundennummer wird deterministisch aus der zufälligen Tenant-UUID abgeleitet, einmalig gespeichert und durch einen Unique-Index geschützt. Sie enthält keine E-Mail-Adresse, Anschrift oder andere Kundendaten.

## Kundenakte

Die Mandantendetailseite dient als Kundenakte. Sie zeigt:

- Kundennummer, Lead-ID und Tenant-ID,
- Ursprung und Stand der Akquise,
- Rückmeldungen aus der postalischen Akquise,
- Akquise-Aktivitäten und zuständige Bearbeiter,
- protokollierte Mandantenereignisse,
- aktive und frühere Paketzuweisungen,
- die bei jeder Paketzuweisung geltenden Einrichtungs- und Monatspreise.

Alle Ereignisse werden chronologisch zusammengeführt. Technische Systemprotokolle und fachliche Akquise-Aktivitäten bleiben getrennte Datenbestände; die Kundenakte stellt sie nur gemeinsam dar.

## Einrichtung und Löschung

Pro Lead darf gleichzeitig nur ein gültiger Einrichtungslink bestehen. Abbruch und erfolgreicher Abschluss werden als Akquise-Aktivität gespeichert. Ein Lead mit verbundener Kundeninstanz oder laufender Einrichtung kann nicht aus dem Akquise-CRM gelöscht werden.

Wird eine Kundeninstanz bewusst gelöscht, werden die mandantengebundenen Website-Daten entsprechend dem bestehenden Löschablauf entfernt. Die Akquise-Historie erhält vorher einen Eintrag mit der Kundennummer; der Lead wird als ehemaliger Kunde ohne aktive Instanz gekennzeichnet. Aufbewahrungspflichtige spätere Rechnungsdaten dürfen nicht an eine kaskadierende Tenant-Löschung gekoppelt werden.

## Abrechnungsgrundlage

Eine Paketzuweisung speichert Namen, Einrichtungspreis und Monatspreis als Snapshot in der Subscription. Spätere Änderungen an der allgemeinen Preisliste verändern damit nicht rückwirkend den historischen Vertragsstand eines Kunden.

Eine rechtskonforme Rechnungserstellung ist weiterhin nicht Bestandteil des MVP. Vor ihrer Einführung wird ein eigener unveränderlicher Rechnungsdatenbestand benötigt. Jede Rechnung muss mindestens Kundennummer, Vertragszuordnung, Rechnungsnummer, Leistungszeitraum, Positions- und Steuer-Snapshots, Rechnungsanschrift, Status sowie Storno- oder Korrekturbezüge enthalten. Konkrete Regeln bleiben in `OD-23` offen.
