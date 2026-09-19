# Postalische Akquise

Stand: 18. September 2026.

## Ziel und Abgrenzung

FahrSeiten kann einen persönlichen, signierten Link und einen QR-Code für einen vorhandenen Akquise-Kontakt erzeugen. Der Link ist für einen adressierten Brief bestimmt und führt auf eine eigene Rückmeldeseite unter `/brief/{leadId}`. Die bestehende Produktwebsite und die Beispielwebsite unter `/demo` bleiben davon getrennt.

Die Plattform erzeugt inzwischen personalisierte A4-Briefe mit Empfängeranschrift, fester Lead-ID, signiertem Rückmeldelink und QR-Code. Unter **Akquise → Briefakquise** kann das PDF geprüft und anschließend kontrolliert an OnlineBrief24 übertragen werden. Jeder Vorgang wird mit Modus, Prüfsumme, Anbieter-Auftragsnummer, Status und Fehlercode in der Lead-Historie gespeichert.

Der sichere Ausgangswert ist `ONLINEBRIEF_MODE=test`. Laut Anbieter landen diese Aufträge nur im OnlineBrief24-Warenkorb und werden nicht unmittelbar produziert. Ein kostenpflichtiger Liveversand ist nur mit `ONLINEBRIEF_MODE=live` möglich und verlangt in der Oberfläche zusätzlich die erneute Eingabe der festen Lead-ID. Auftragsverarbeitungsvertrag, Kosten, Adressquelle und rechtliche Freigabe bleiben vor dem ersten echten Versand zu prüfen.

## Ablauf

1. Ein berechtigter Plattformbenutzer legt im Akquise-CRM einen Kontakt an.
2. In der Kundenakte werden die vollständige Postanschrift und der persönliche Brief-Link gepflegt. Derselbe Link kann weiterhin einzeln als SVG-QR-Code heruntergeladen werden.
3. Unter **Briefakquise** werden Kundenakte, Überschrift, Brieftext und optional
   ein Bild aus dem Plattform-Medienbereich ausgewählt. Die Plattform erzeugt
   daraus ein personalisiertes PDF mit Logo, Absender, Empfänger, Datum,
   Lead-ID und QR-Code. Nach der Sichtprüfung kann es in den Testwarenkorb oder
   nach gesonderter Livefreigabe in die Produktion übertragen werden.
4. Die angeschriebene Fahrschule öffnet die gesonderte Rückmeldeseite und kann die Produktbeispielseite unverbindlich ansehen.
5. Sie wählt genau eine Rückmeldung:
   - Interesse,
   - weitere Informationen per E-Mail,
   - kein Interesse und keine weiteren Informationen.
6. Bei Interesse oder Informationswunsch müssen eine E-Mail-Adresse und eine gesonderte, freiwillige Einwilligung angegeben werden. Das System sendet zunächst nur eine Bestätigungsnachricht.
7. Erst der Klick auf den einmal verwendbaren Bestätigungslink dokumentiert die Einwilligung und stellt die angeforderte Informationsmail in die Versandwarteschlange.
8. Eine Ablehnung sperrt weitere Akquise-E-Mails für diesen Kontakt, entfernt noch nicht versandte Akquise-Jobs und setzt den Kontakt auf `lost`.

Die Bestätigungs- und Informationsmails werden durch die bestehende Hintergrundjob-Verarbeitung verschickt. Dafür müssen SMTP und der Plesk-Cronjob funktionsfähig eingerichtet sein. Ein bloßer Seitenaufruf bestätigt keine Einwilligung; die Bestätigung erfolgt ausdrücklich per POST, damit automatische Linkprüfungen von Mailprogrammen keine Zustimmung auslösen.

## Onlinebrief24

Der technische Adapter erzeugt den von Onlinebrief24 dokumentierten
JSON-Request mit PDF als Base64, MD5-Prüfsumme, Lead-ID im Hinweisfeld und der
Kostenstelle `FahrSeiten Akquise`. Der Adapter akzeptiert PDFs bis 50 MB und
trennt Test- und Live-Modus. Im Testmodus landen Aufträge laut Anbieter im
Warenkorb und werden nicht unmittelbar produziert. Der Live-Modus ist
kostenpflichtig und verlangt deshalb im Anwendungscode zusätzlich die erneute
Bestätigung der festen Lead-ID.

API-Key und API-Secret werden nur als Plesk-Umgebungsvariablen gesetzt. Das
Repository enthält keine Zugangsdaten. Vor dem ersten echten Versand bleiben
Briefvorlage, Empfängeranschrift, Seitenformat, Fensterposition, Guthaben,
Preis und der Auftrag im Onlinebrief24-Warenkorb manuell zu prüfen. Der
Testmodus überträgt den Auftrag jetzt aktiv in diesen Warenkorb; erst der
ausdrücklich freigegebene Livemodus löst eine unmittelbare Produktion aus.

Quelle: [Onlinebrief24 API-Dokumentation](https://www.onlinebrief24.de/briefe-uebertragen/api)

## Datenschutz und Nachweis

Die Anwendung speichert die gewählte Rückmeldung, Zeitpunkt, angegebene E-Mail-Adresse, verwendete Einwilligungstext-Version, Bestätigungszeitpunkt und zugehörige CRM-Aktivitäten. Der technische Schlüssel des Bestätigungslinks wird nur gehasht gespeichert und läuft nach 24 Stunden ab.

Die Ablehnungsoption erteilt keine Werbeeinwilligung. Eine E-Mail-Einwilligung darf nicht in AGB versteckt oder als Voraussetzung für die Ablehnung verlangt werden. Jede Informationsmail enthält eine sichtbare Abmeldemöglichkeit und einen `List-Unsubscribe`-Header. Adressquelle, Interessenabwägung für den Briefversand, Aufbewahrungsfristen und Sperrlistenprozess müssen vor der produktiven Akquise fachlich und rechtlich freigegeben werden.

## AGB

Unter `/admin/rechtliches` kann ein eigener AGB-Entwurf erzeugt, strukturiert bearbeitet und veröffentlicht werden. Nicht entschiedene Geschäftsbedingungen bleiben im Entwurf sichtbar markiert. Die Veröffentlichungssperre verhindert, dass ein Text mit solchen Platzhaltern versehentlich live geht. Die öffentliche Seite liegt unter `/agb`.

Der AGB-Entwurf ersetzt keine rechtliche Prüfung. E-Mail-Werbeeinwilligungen werden unabhängig von den AGB erfasst und nachgewiesen.

## Manuelle Prüfung

1. Einen ausschließlich fiktiven Lead mit vollständiger Postanschrift anlegen.
2. Unter **Briefakquise** das PDF erzeugen und Empfänger, Absender, Lead-ID, Link und QR-Code prüfen.
3. Den Auftrag mit `ONLINEBRIEF_MODE=test` übertragen und im OnlineBrief24-Warenkorb kontrollieren. Dort nicht produktiv absenden.
4. Prüfen, dass Link und QR-Code ausschließlich diesen Lead adressieren und ungültige Signaturen abgewiesen werden.
5. „Interesse“ ohne Einwilligung absenden; der Vorgang muss scheitern.
6. Mit einer Testadresse zustimmen, Cronjob ausführen und die Bestätigungsmail prüfen.
7. Den Link bestätigen, Cronjob erneut ausführen und Informationsmail, `/demo`-Link und Abmeldelink prüfen.
8. Einen zweiten fiktiven Lead ablehnen und kontrollieren, dass keine E-Mail-Einwilligung entsteht und keine offenen Akquise-Jobs verbleiben.
9. Dieselbe Rückmeldeseite erneut absenden; eine zweite Antwort muss verhindert werden.
