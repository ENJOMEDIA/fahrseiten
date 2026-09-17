# Kontaktformulare und Anfrageverwaltung

Stand: 17. September 2026.

## Öffentliche Erfassung

Jedes Formular gehört einem Tenant und verweist auf eine konkrete Version des Datenschutzhinweises. Name, E-Mail, Nachricht und ausdrückliche Einwilligung sind im Demoformular Pflicht. Telefon und Führerscheininteresse bleiben optional. Der Server validiert sämtliche Grenzen erneut.

Der Spam-Schutz kombiniert ein unsichtbares Honeypot-Feld, eine Mindestdauer von zwei Sekunden, ein maximales Formularalter von zwei Stunden und eine Drosselung. Die lokale Demo bildet den Fingerprint ohne IP-Adresse aus einem Hash des User-Agent. Für einen vertrauenswürdigen Proxybetrieb muss vor Staging eine datensparsame, persistente Rate-Limit-Strategie festgelegt werden.

Erfolgs- und Fehlermeldungen enthalten keine Formulardaten. Technische Fehler dürfen weder Name, Kontaktdaten noch Nachricht protokollieren. Die Demo-Route ist im Produktionsmodus deaktiviert und darf nur fiktive Angaben erhalten.

## Anfrageverwaltung

Anfragen kennen die Status `new`, `in_progress`, `answered`, `completed` und `spam`. Tenantgebundene Notizen, Zuständigkeit, Wiedervorlage und Statushistorie sind modelliert. Jeder Statuswechsel erhält Tenant, handelnden Benutzer und Vorher-/Nachher-Status; das bestehende Audit-Log wird in der persistenten Repository-Transaktion mitgeführt.

Export und datenschutzgerechte Löschung sind durch `deleted_at` und getrennte Notizen vorbereitet. Format, Aufbewahrung und Freigaberechte bleiben Teil der rechtlichen Entscheidung OD-12. Es findet noch keine endgültige Löschung statt.

Nach erfolgreicher Speicherung markiert das Repository die Benachrichtigung atomar als eingeplant. Nur beim ersten Übergang wird die zentrale `NotificationPort` mit dem Schlüssel `contact:<inquiry-id>` aufgerufen. E-Mail-Zustellung, Retry und persistente Jobs folgen in Schritt 14; SMS und WhatsApp sind nicht implementiert.

## Manuelle Prüfung

1. `/demo/kontakt` öffnen, ausschließlich fiktive Daten eingeben, mindestens zwei Sekunden warten und absenden.
2. Einen Botwert in das Honeypot-Feld oder eine zu schnelle Anfrage per Test senden; beide müssen mit neutraler Meldung scheitern.
3. Dieselbe Anfrage im Kundenbereich prüfen, sobald die lokale Datenbank verfügbar ist.
4. Status, Notiz und Wiedervorlage mit zwei Test-Tenants prüfen; fremde IDs müssen als nicht gefunden gelten.
