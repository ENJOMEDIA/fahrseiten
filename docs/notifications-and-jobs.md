# E-Mail, Benachrichtigungen und Hintergrundjobs

Stand: 17. September 2026.

## Konfiguration

SMTP wird ausschließlich über `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` und `SMTP_FROM` konfiguriert. `.env.example` enthält nur lokale Platzhalter. `SMTP_MODE=catch` ist der sichere Standard und sendet nichts nach außen. `SMTP_MODE=smtp` verwendet Nodemailer mit TLS beziehungsweise STARTTLS, kurzen Timeouts und ohne SMTP-Debugprotokolle.

Der lokale Catch-Transport hält Nachrichten nur im Prozessspeicher und schreibt weder Empfänger noch Reset-Links in Logs. Für eine manuelle lokale Vorschau kann später ein lokaler SMTP-Mail-Catcher auf Port 1025 verwendet werden; echte Empfänger und Zugangsdaten sind für Tests verboten.

## Vorlagen und Zustellung

Vorlagen besitzen Schlüssel und Version und erzeugen immer Text und HTML. Dynamische Werte werden validiert, HTML-Werte escaped. Implementiert sind Anfragebenachrichtigung, Passwort-Reset, Einladung und Wiedervorlage.

Jeder Job und jede Zustellung besitzt einen eindeutigen Idempotenzschlüssel. Eine reservierte Zustellung mit demselben Schlüssel wird nicht erneut gesendet. Empfänger werden im Zustellprotokoll nur als SHA-256-Hash gespeichert. Fehlerzustände speichern ausschließlich einen kurzen technischen Fehlercode, keine SMTP-Antwort, Adresse oder Nachrichteninhalte.

Ein Absturz genau zwischen erfolgreicher SMTP-Annahme und lokaler Statusspeicherung kann technisch nicht zweifelsfrei von einer fehlgeschlagenen Zustellung unterschieden werden. Vor Produktion ist mit dem gewählten SMTP-Anbieter zu entscheiden, ob in diesem seltenen Fall mögliche Doppelzustellung oder mögliche Nichtzustellung bevorzugt wird.

## Jobs und Scheduler

Jobs werden mit Status, Fälligkeit, Versuchszahl und maximal vier Versuchen gespeichert. Retries erfolgen nach 1, 5 und 30 Minuten. Der Scheduler sperrt fällige Zeilen mit `FOR UPDATE SKIP LOCKED`, verarbeitet höchstens 20 Jobs pro Lauf und gibt nur Summen zurück.

Auf Shared Hosting ruft genau ein Cronjob `POST /api/cron` mit `Authorization: Bearer <CRON_SECRET>` in kurzem Intervall auf. Das Geheimnis benötigt mindestens 24 Zeichen und wird timing-sicher verglichen. Auf einem VPS kann derselbe Runner in einem dauerhaften Worker aufgerufen werden; Job- und Fachlogik ändern sich nicht.

## Manuelle Prüfung

1. `SMTP_MODE=catch` und ein lokales `CRON_SECRET` setzen, Migration anwenden und Testjobs der vier Vorlagen einreihen.
2. Den Cron-Einstieg ohne und mit falschem Bearer-Token prüfen; beide müssen 401 liefern.
3. Den Einstieg zweimal mit richtigem Token ausführen; jede Idempotenzkennung darf höchstens eine Zustellung erzeugen.
4. Einen absichtlich fehlschlagenden Transport testen und Retry-Zeiten sowie endgültigen Fehler nach dem vierten Versuch prüfen.
5. SMTP erst mit einem lokalen Mail-Catcher testen; keine echten Adressen verwenden.
