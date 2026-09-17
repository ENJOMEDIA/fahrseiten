# Kontrollierter Block-Builder

Stand: 17. September 2026.

## Bedienmodell

Der Builder bearbeitet Seiten als geordnete Liste freigegebener Blöcke. Nutzer können Seiten auswählen oder anlegen sowie Blöcke hinzufügen, duplizieren, mit sichtbaren Tastatur-Schaltflächen verschieben und ausblenden. Es gibt keine freie Positionierung und keine Eingabe für HTML, CSS oder JavaScript.

Formularfelder richten sich nach dem Blocktyp. Ungültige Pflichtfelder werden direkt am Block angezeigt und verhindern die Veröffentlichung. Die Vorschau verwendet denselben `BlockRenderer` wie die öffentliche Website und bietet feste Desktop-, Tablet- und Mobilbreiten. Theme-Einstellungen sind auf freigegebene Farb-, Schrift- und Logooptionen begrenzt.

Entwurfsänderungen werden nach kurzer Ruhezeit validiert gespeichert. Der Status „Wird gespeichert“, „Entwurf gespeichert“ oder „Speichern fehlgeschlagen“ bleibt sichtbar. Während eines laufenden oder fehlgeschlagenen Speichervorgangs aktiviert die Oberfläche den Browserhinweis für ungespeicherte Änderungen. Optimistische Zustände werden nicht als gespeichert bezeichnet, bevor der Server bestätigt hat.

Veröffentlichen validiert den gesamten Entwurf. Jede erfolgreiche Veröffentlichung erzeugt eine Version. Wiederherstellen kopiert die gewählte Version in den aktuellen Entwurf; die öffentliche Version wird dadurch noch nicht verändert. Das Persistenzmodell und die spätere Datenbanktransaktion folgen ADR 0005.

## Lokale Prüfumgebung

Der echte Kundenpfad `/kunde/website/builder` bleibt durch die serverseitige Sitzung geschützt. Weil lokal keine MySQL-Instanz verfügbar ist, stellt `/builder-demo` nur im Entwicklungsmodus dieselbe Oberfläche mit einem In-Memory-Fixture bereit. Auch der Demo-Autosave-Endpunkt antwortet in Produktion mit 404. Er ist kein Kunden- oder Produktionsspeicher.

## Manuelle Prüfung

1. `pnpm dev` starten und `/builder-demo` öffnen.
2. Überschrift ändern und auf „Entwurf gespeichert“ warten.
3. Je einen Blocktyp hinzufügen, duplizieren, ausblenden und mit den Pfeiltasten verschieben.
4. Desktop-, Tablet- und Mobilvorschau wählen.
5. Eine Pflichtüberschrift leeren; die Veröffentlichung muss blockiert werden.
6. Gültigen Inhalt veröffentlichen, erneut ändern und die Version als Entwurf wiederherstellen.
