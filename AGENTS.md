# Verbindliche Git-Arbeitsweise

Diese Vorgaben gelten für alle Aufgaben im gesamten Projekt.

Nach jeder vollständig erledigten und erfolgreich geprüften Aufgabe sind diese Schritte in der angegebenen Reihenfolge auszuführen:

1. Mit `git status` den Zustand des Arbeitsverzeichnisses prüfen.
2. Ausschließlich die zur Aufgabe gehörenden Dateien gezielt stagen.
3. Einen aussagekräftigen Commit nach Conventional Commits erstellen, beispielsweise `docs: Git-Arbeitsweise dokumentieren`.

- Vorerst keinen automatischen `git push` ausführen. Die Übertragung erfolgt manuell über GitHub Desktop.
- Am Ende jeder abgeschlossenen Aufgabe den Commit-Hash und die Commit-Nachricht deutlich mitteilen und darauf hinweisen, dass der Commit über GitHub Desktop mit „Push origin“ übertragen werden kann.
- Niemals Force-Push verwenden, auch nicht mit `--force-with-lease`.
- Niemals fremde oder nicht zur Aufgabe gehörende Änderungen verwerfen oder in den eigenen Commit aufnehmen.
- Bei Konflikten oder fehlgeschlagenen Tests sofort stoppen und die genaue Ursache melden. Die nachfolgenden Schritte dürfen dann nicht ausgeführt werden.
- Secrets, Zugangsdaten, `.env`-Dateien und echte Kundendaten dürfen niemals committed werden. Vor dem Commit die gestagten Änderungen darauf prüfen.
