# Fahrschulinhalte

Stand: 17. September 2026.

## Gemeinsame Regeln

Führerscheinklassen, Preisgruppen, Preispositionen, Kurse, Termine, Teammitglieder, Fahrzeuge, Standorte, Öffnungszeiten und manuell gepflegte Bewertungen tragen immer `tenant_id`. Die Repository-Schicht muss jede Abfrage mit dem geprüften Tenant-Kontext einschränken. `position` steuert eine stabile Reihenfolge, `active` die öffentliche Sichtbarkeit.

Preise werden in MySQL als `DECIMAL(10,2)` und in TypeScript als Dezimalzeichenkette behandelt. Eine Umwandlung in JavaScript-Gleitkommazahlen ist nur für die Anzeigeformatierung erlaubt, nie für Berechnung oder Speicherung. Die Währung ist als ISO-4217-Code vorbereitet und im MVP auf EUR validiert.

Kurstermine speichern einen UTC-Zeitpunkt sowie die zugehörige IANA-Zeitzone. Eingaben benötigen einen expliziten Offset. Öffnungszeiten verwenden lokale Uhrzeiten und ISO-Wochentage 1 bis 7. Eine spätere Buchungsfunktion ist daraus nicht abzuleiten und gehört nicht zum MVP.

Bewertungen sind ausschließlich manuell gepflegte Inhalte. Es gibt keine externe Bewertungsabfrage, Verifikation oder automatische Veröffentlichung. Demo-Namen, Adressen, Preise und Aussagen sind vollständig fiktiv.

## Öffentliche Blocktypen

Für jedes Fachmodul existiert ein kontrollierter Blocktyp mit demselben Validierungsmodell: `license_classes`, `prices`, `courses`, `team`, `fleet`, `locations` und `testimonials`. Inaktive Einträge werden nicht dargestellt. Standortausgaben bereiten strukturierte `DrivingSchool`-Metadaten vor. Beliebiges HTML ist weiterhin ausgeschlossen.

## Leere Zustände

Ein Block darf eine leere, valide Liste enthalten. Der spätere Builder zeigt dafür einen redaktionellen Leerzustand. Öffentlich wird kein erfundener Ersatzinhalt erzeugt. Inaktive oder fehlende Datensätze erscheinen nicht.

## Manuelle Prüfung

1. `/demo` öffnen und bis zu Führerscheinklassen, Preisen, Kursen, Team, Fuhrpark, Standort und Stimmen scrollen.
2. Geldbeträge auf genau zwei Dezimalstellen und deutsche Anzeige prüfen.
3. Prüfen, dass alle Inhalte sichtbar als fiktive Demo erkennbar sind.
4. Mit MySQL Migration und Seed anwenden und die Einträge ausschließlich im Demo-Tenant prüfen.
