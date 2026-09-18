# Postalische Akquise

Stand: 18. September 2026.

## Ziel und Abgrenzung

FahrSeiten kann einen persönlichen, signierten Link und einen QR-Code für einen vorhandenen Akquise-Kontakt erzeugen. Der Link ist für einen adressierten Brief bestimmt und führt auf eine eigene Rückmeldeseite unter `/brief/{leadId}`. Die bestehende Produktwebsite und die Beispielwebsite unter `/demo` bleiben davon getrennt.

Eine Anbindung an einen Briefdienstleister ist noch nicht aktiv. Insbesondere werden derzeit keine Briefe automatisch bestellt, bezahlt oder an einen externen Anbieter übertragen. Die Auswahl eines Anbieters, dessen Auftragsverarbeitungsvertrag, Kosten, Testbetrieb und produktive Freigabe bleiben offene Entscheidungen.

## Ablauf

1. Ein berechtigter Plattformbenutzer legt im Akquise-CRM einen Kontakt an.
2. In der Kontaktkarte wird ein persönlicher Brief-Link angezeigt. Derselbe Link kann als SVG-QR-Code heruntergeladen werden.
3. Die angeschriebene Fahrschule öffnet die gesonderte Rückmeldeseite und kann die Produktbeispielseite unverbindlich ansehen.
4. Sie wählt genau eine Rückmeldung:
   - Interesse,
   - weitere Informationen per E-Mail,
   - kein Interesse und keine weiteren Informationen.
5. Bei Interesse oder Informationswunsch müssen eine E-Mail-Adresse und eine gesonderte, freiwillige Einwilligung angegeben werden. Das System sendet zunächst nur eine Bestätigungsnachricht.
6. Erst der Klick auf den einmal verwendbaren Bestätigungslink dokumentiert die Einwilligung und stellt die angeforderte Informationsmail in die Versandwarteschlange.
7. Eine Ablehnung sperrt weitere Akquise-E-Mails für diesen Kontakt, entfernt noch nicht versandte Akquise-Jobs und setzt den Kontakt auf `lost`.

Die Bestätigungs- und Informationsmails werden durch die bestehende Hintergrundjob-Verarbeitung verschickt. Dafür müssen SMTP und der Plesk-Cronjob funktionsfähig eingerichtet sein. Ein bloßer Seitenaufruf bestätigt keine Einwilligung; die Bestätigung erfolgt ausdrücklich per POST, damit automatische Linkprüfungen von Mailprogrammen keine Zustimmung auslösen.

## Datenschutz und Nachweis

Die Anwendung speichert die gewählte Rückmeldung, Zeitpunkt, angegebene E-Mail-Adresse, verwendete Einwilligungstext-Version, Bestätigungszeitpunkt und zugehörige CRM-Aktivitäten. Der technische Schlüssel des Bestätigungslinks wird nur gehasht gespeichert und läuft nach 24 Stunden ab.

Die Ablehnungsoption erteilt keine Werbeeinwilligung. Eine E-Mail-Einwilligung darf nicht in AGB versteckt oder als Voraussetzung für die Ablehnung verlangt werden. Jede Informationsmail enthält eine sichtbare Abmeldemöglichkeit und einen `List-Unsubscribe`-Header. Adressquelle, Interessenabwägung für den Briefversand, Aufbewahrungsfristen und Sperrlistenprozess müssen vor der produktiven Akquise fachlich und rechtlich freigegeben werden.

## AGB

Unter `/admin/rechtliches` kann ein eigener AGB-Entwurf erzeugt, strukturiert bearbeitet und veröffentlicht werden. Nicht entschiedene Geschäftsbedingungen bleiben im Entwurf sichtbar markiert. Die Veröffentlichungssperre verhindert, dass ein Text mit solchen Platzhaltern versehentlich live geht. Die öffentliche Seite liegt unter `/agb`.

Der AGB-Entwurf ersetzt keine rechtliche Prüfung. E-Mail-Werbeeinwilligungen werden unabhängig von den AGB erfasst und nachgewiesen.

## Manuelle Prüfung

1. Einen ausschließlich fiktiven Lead anlegen und dessen persönlichen Link in der Kontaktkarte öffnen.
2. Prüfen, dass Link und QR-Code ausschließlich diesen Lead adressieren und ungültige Signaturen abgewiesen werden.
3. „Interesse“ ohne Einwilligung absenden; der Vorgang muss scheitern.
4. Mit einer Testadresse zustimmen, Cronjob ausführen und die Bestätigungsmail prüfen.
5. Den Link bestätigen, Cronjob erneut ausführen und Informationsmail, `/demo`-Link und Abmeldelink prüfen.
6. Einen zweiten fiktiven Lead ablehnen und kontrollieren, dass keine E-Mail-Einwilligung entsteht und keine offenen Akquise-Jobs verbleiben.
7. Dieselbe Rückmeldeseite erneut absenden; eine zweite Antwort muss verhindert werden.
