# Verbindliche Git-Arbeitsweise

Diese Vorgaben gelten für alle Aufgaben im gesamten Projekt.

Nach jeder vollständig erledigten und erfolgreich geprüften Aufgabe sind diese Schritte in der angegebenen Reihenfolge auszuführen:

1. Mit `git status` den Zustand des Arbeitsverzeichnisses prüfen.
2. Ausschließlich die zur Aufgabe gehörenden Dateien gezielt stagen.
3. Einen aussagekräftigen Commit nach Conventional Commits erstellen, beispielsweise `docs: Git-Arbeitsweise dokumentieren`.
4. Den Commit auf den aktuellen Branch zu `origin` pushen.

- Wenn auf `main` gearbeitet wird, darf direkt zu `origin/main` gepusht werden.
- Niemals Force-Push verwenden, auch nicht mit `--force-with-lease`.
- Niemals fremde oder nicht zur Aufgabe gehörende Änderungen verwerfen oder in den eigenen Commit aufnehmen.
- Bei Konflikten, fehlgeschlagenen Tests oder einem Push-Fehler sofort stoppen und die genaue Ursache melden. Die nachfolgenden Schritte dürfen dann nicht ausgeführt werden.
- Zugangsdaten, `.env`-Dateien und andere Geheimnisse dürfen niemals committed werden. Vor dem Commit die gestagten Änderungen darauf prüfen.
