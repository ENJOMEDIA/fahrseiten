# Support, Fehler und Monitoring

Stand: 17. September 2026.

## Fehlernachverfolgung

Nutzerfreundliche Fehlerseiten zeigen keine Stacktraces oder Formulardaten. Wenn Next.js eine Digest-ID bereitstellt, wird sie als gekürzte Referenz angezeigt. Manuell gemeldete Fehler erhalten eine zufällige Referenz-ID im Format `FS-XXXXXXXX`. FahrSeiten-Marketing und Kunden-Backend verwenden dasselbe validierte Formular; ein Mandantenbezug darf im produktiven Kundenpfad nur aus dem serverseitig geprüften Session- und Tenant-Kontext ergänzt werden.

`error_reports` speichert Kurztitel und die bewusst eingegebene Beschreibung. Technische Logs erhalten dagegen niemals vollständige Formulareingaben. `technicalLog` schreibt strukturierte JSON-Ereignisse, redigiert Schlüssel für Passwörter, Tokens, Authorization, Cookies, Kontaktangaben und Formtexte und begrenzt verbleibende Strings. Fachliche `audit_logs` und technische `technical_events` bleiben getrennte Tabellen.

## Supporttickets und Plattformübersicht

Supporttickets sind mandantengebunden und besitzen Status, Priorität, Zuweisung und einen Nachrichtenverlauf. Geschlossene Tickets können nicht still wieder geöffnet werden; gelöste Tickets können nachvollziehbar in Bearbeitung zurückkehren. Der Plattform-Support sieht nach der vorhandenen Rollenprüfung Zähler für neue Fehlerberichte, fehlgeschlagene Hintergrundjobs und nicht erledigte technische Ereignisse. Die vorhandene Diagnoseansicht bleibt lesend und auditpflichtig.

## Health und Readiness

`/api/health` bestätigt ausschließlich, dass der Prozess antwortet, und liefert Zeitstempel und Laufzeit. `/api/ready` prüft lokalen Monitoring-Adapter und je Betriebsmodus die Datenbank oder den gekennzeichneten Fixture-Modus. Ein Fehler liefert HTTP 503 und eine Referenz-ID ohne interne Fehlermeldung. Beide Antworten setzen `Cache-Control: no-store`.

`MonitoringAdapter` trennt die Anwendung von einem späteren externen oder selbst gehosteten Monitoringdienst. Der aktuelle lokale Adapter sendet nichts nach außen. Anbieter, Alarmwege, Bereitschaftszeiten, Eskalation und Aufbewahrung bleiben vor Staging beziehungsweise Produktivstart festzulegen.

## Manuelle Prüfung

1. Einen fiktiven Bericht über `/fehler-melden` senden und die Referenz-ID prüfen.
2. Kundenroute `/kunde/fehler-melden` nach Anmeldung und Rollenprüfung öffnen.
3. Ungültige Eingaben an `/api/error-report` senden; Antwort darf keinen Stacktrace enthalten.
4. `/api/health` und `/api/ready` im Fixture-Modus prüfen; vor Staging Readiness mit Testdatenbank wiederholen.
5. Strukturierte Testlogs auf redigierte Schlüssel prüfen und keine produktiven Benachrichtigungen auslösen.
