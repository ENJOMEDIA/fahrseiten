# Plesk-Deployment

Stand: 17. September 2026. Diese Anleitung bereitet FahrSeiten für ein Plesk-Deployment vor. Sie führt selbst keine Änderung an Hosting, DNS, SSL, Datenbank oder Produktivsystem aus. Werte in spitzen Klammern sind bewusst nicht auszufüllen und dürfen nicht committed werden.

## Bereitstellungsmodell

`pnpm build:plesk` erzeugt unter `dist/plesk` ein eigenständig lauffähiges Next.js-Standalone-Artefakt. Es enthält den von Next.js erzeugten Minimalserver, statische Dateien, öffentliche Assets, Drizzle-Migrationen sowie folgende Plesk-Einstiegspunkte:

- `app.mjs` validiert die Produktionskonfiguration und startet danach den erzeugten Next.js-Server.
- `migrate.mjs` wendet die versionierten Drizzle-Migrationen an.
- `cron.mjs` ruft den geschützten Scheduler auf, ohne das Cron-Secret in die Kommandozeile zu schreiben.
- `DEPLOYMENT.json` beschreibt Runtime und Startdatei des Artefakts.

Das Artefakt enthält keine `.env`-Datei. Secrets werden ausschließlich als geschützte Plesk-Umgebungsvariablen hinterlegt.

## Voraussetzungen in Plesk

Vor einem Upload sind im Plesk-Panel oder beim Hostinganbieter diese Punkte zu prüfen:

1. Plesk Node.js Toolkit ist aktiv und stellt **Node.js 22.x** bereit.
2. Die Anwendung läuft auf Linux und erlaubt eine benutzerdefinierte Startdatei im Application Root.
3. Eine unterstützte MySQL-/MariaDB-Datenbank samt eigenem Benutzer ist vorhanden.
4. Shell-Zugriff oder eine gleichwertige Möglichkeit zum einmaligen Ausführen von `node migrate.mjs` ist vorhanden.
5. Persistenter Speicher und Schreibrechte sind für spätere Uploads geklärt. Der lokale `.local-storage`-Adapter ist nicht als produktiver Speicher freigegeben.
6. Plesk kann alle vorgesehenen Hosts auf dieselbe Node.js-Anwendung leiten und den ursprünglichen `Host`-Header erhalten.

Fehlt Node.js 22, eine Startmöglichkeit oder der Host-Header bleibt nicht erhalten, darf das Deployment nicht fortgesetzt werden.

## Artefakt erzeugen

Das Deployment-Artefakt muss auf Linux mit derselben CPU-Architektur wie das Plesk-System erzeugt werden. Ein auf macOS gebautes Standalone-Verzeichnis darf wegen möglicher nativer Abhängigkeiten nicht direkt auf den Linux-Server kopiert werden.

Der manuell startbare GitHub-Actions-Workflow `Plesk-Artefakt` baut und prüft das Linux-Artefakt mit Node.js 22 und stellt es anschließend für 14 Tage als komprimiertes Workflow-Artefakt bereit. Er enthält keine Secrets und führt kein Deployment aus.

Alternativ kann das Artefakt aus einem sauberen Checkout direkt auf einem kompatiblen Linux-System mit Node.js 22 und pnpm 11 erzeugt werden:

```bash
corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm install --frozen-lockfile
pnpm test:plesk
pnpm build:plesk
pnpm verify:plesk
```

Nur der Inhalt von `dist/plesk` beziehungsweise des entpackten Linux-Artefakts wird als Application Root bereitgestellt. `node_modules` muss auf Plesk nicht erneut installiert werden, weil Next.js die benötigten Runtime-Abhängigkeiten in das Standalone-Artefakt aufnimmt.

## Plesk-Einstellungen

Für die Domain `fahrseiten.de` sind folgende Werte vorgesehen:

| Plesk-Feld               | Wert                               |
| ------------------------ | ---------------------------------- |
| Node.js-Version          | `22.x`                             |
| Application Mode         | `production`                       |
| Application Root         | Verzeichnis mit dem Artefaktinhalt |
| Document Root            | `<Application Root>/public`        |
| Application Startup File | `app.mjs`                          |

Die Plesk-Startdatei muss direkt im Application Root liegen. Das entspricht der Vorgabe des Plesk Node.js Toolkits. Plesk beziehungsweise der vorgeschaltete Webserver übernimmt TLS und Reverse Proxy; der Node-Prozess lauscht ausschließlich auf dem von Plesk gesetzten `PORT`.

## Umgebungsvariablen

Mindestens diese Variablen werden in Plesk hinterlegt:

| Variable              | Vorgesehener Inhalt                                                         |
| --------------------- | --------------------------------------------------------------------------- |
| `NODE_ENV`            | `production`                                                                |
| `APP_BASE_URL`        | `https://fahrseiten.de`                                                     |
| `DATABASE_URL`        | MySQL-URL mit ausschließlich dort hinterlegten Zugangsdaten                 |
| `DEMO_DATA_MODE`      | `database`                                                                  |
| `MARKETING_HOSTS`     | `fahrseiten.de,www.fahrseiten.de`                                           |
| `APP_HOSTS`           | `app.fahrseiten.de`                                                         |
| `DEMO_HOSTS`          | Nur tatsächlich eingerichtete Testhosts oder ein bewusst leerer Wert        |
| `TRUST_PROXY_HEADERS` | Zunächst `false`; nur nach dokumentierter Proxy-Prüfung auf `true` setzen   |
| `SMTP_MODE`           | `smtp`                                                                      |
| `SMTP_HOST`           | Host des freigegebenen SMTP-Anbieters                                       |
| `SMTP_PORT`           | Port des freigegebenen SMTP-Anbieters                                       |
| `SMTP_SECURE`         | `true` für implizites TLS, andernfalls `false` für STARTTLS                 |
| `SMTP_USER`           | SMTP-Benutzer, falls benötigt                                               |
| `SMTP_PASSWORD`       | SMTP-Passwort, falls benötigt                                               |
| `SMTP_FROM`           | Freigegebener Absender, beispielsweise `FahrSeiten <noreply@fahrseiten.de>` |
| `CRON_SECRET`         | Kryptografisch zufälliger Wert mit mindestens 24 Zeichen                    |

`PORT` und gegebenenfalls `HOSTNAME` werden von Plesk beziehungsweise seiner Node.js-Laufzeit verwaltet. Sie dürfen nicht hart im Repository eingetragen werden. Die Startvalidierung nennt ausschließlich fehlerhafte Variablennamen oder Regeln und gibt keine Secret-Werte aus.

## Domain- und Proxy-Prüfung

`fahrseiten.de` und `www.fahrseiten.de` gehören zur Marketingoberfläche. `app.fahrseiten.de` gehört zum Plattform- und Kunden-Backend. Externe Kundendomains werden später als eigene Domains oder Aliase auf dieselbe Anwendung geführt; sie dürfen nicht per HTTP-Weiterleitung auf `fahrseiten.de` umgebogen werden, weil die Tenant-Auflösung den ursprünglichen Host benötigt.

Nach dem ersten isolierten Stagingstart sind `Host` und `X-Forwarded-Host` mit einer Testdomain zu prüfen. `TRUST_PROXY_HEADERS=false` bleibt die sichere Voreinstellung. Eine Umstellung auf `true` ist nur zulässig, wenn Plesk eingehende Forwarded-Header überschreibt und ausschließlich den verifizierten öffentlichen Host weitergibt.

## Datenbankmigration

Vor jeder Migration:

1. Plesk-Datenbankexport oder gleichwertiges konsistentes Backup erstellen.
2. Zeitstempel, Datenbankname und Artefaktversion aus `DEPLOYMENT.json` protokollieren.
3. Backup-Datei außerhalb des öffentlich erreichbaren Document Root ablegen und Zugriff beschränken.
4. Wiederherstellbarkeit des Backups nach dem betrieblichen Verfahren bestätigen.
5. Im neuen Application Root mit gesetzter `DATABASE_URL` ausführen:

```bash
node migrate.mjs
```

Bei einem Fehler wird nicht gestartet oder neu migriert, bis die konkrete Ursache geklärt ist. Der Demo-Seed wird niemals in Staging oder Produktion ausgeführt.

## Start und Healthcheck

Nach Migration und vollständiger Umgebungskonfiguration wird die App im Plesk-Panel neu gestartet. Danach:

```bash
curl --fail --silent --show-error https://fahrseiten.de/api/health
curl --fail --silent --show-error https://fahrseiten.de/api/ready
```

`/api/health` bestätigt nur den laufenden Prozess. `/api/ready` prüft zusätzlich die Datenbankverbindung und muss `status: ready` sowie `database: ok` liefern. Anschließend sind Marketingseite, Login, ein authentifizierter Backend-Aufruf und die Auflösung jeder eingerichteten Testdomain manuell zu prüfen.

## Scheduler

Der Plesk-Scheduler startet in einem kurzen, noch festzulegenden Intervall:

```bash
node <Application Root>/cron.mjs
```

Der Scheduled Task benötigt `APP_BASE_URL` und `CRON_SECRET` in seiner geschützten Laufzeitumgebung. Das Secret darf nicht als sichtbares Kommandozeilenargument oder in einer versionierten Datei stehen. Falls Plesk die Node-Anwendungsvariablen nicht an Scheduled Tasks weitergibt, muss vor Aktivierung ein vom Hostinganbieter empfohlener geschützter Mechanismus gewählt werden.

## Release- und Rollbackablauf

Jedes Deployment erhält ein neues, unveränderliches Release-Verzeichnis. Das bisherige Release bleibt bis zur erfolgreichen Abnahme erhalten.

1. Neues Artefakt in ein separates Release-Verzeichnis laden.
2. Umgebungsvariablen und Dateirechte prüfen.
3. Datenbankbackup erstellen und Migration ausführen.
4. Plesk Application Root auf das neue Release umstellen oder den vorbereiteten atomaren Verzeichniswechsel ausführen.
5. App neu starten und Health-/Readiness-Checks ausführen.
6. Erst nach erfolgreicher Abnahme das vorherige Release nach der vereinbarten Frist entfernen.

Bei einem reinen Codefehler wird auf das vorherige Release zurückgeschaltet und die App neu gestartet. Enthält das Release eine nicht rückwärtskompatible Migration, reicht ein Code-Rollback nicht aus; dann ist nach dokumentierter Entscheidung das unmittelbar zuvor erstellte Datenbankbackup wiederherzustellen. Automatische destructive Down-Migrationen sind nicht vorgesehen.

## Noch manuell zu entscheiden oder zu prüfen

- konkret verfügbare Plesk- und Node.js-Version
- Pfadkonvention für unveränderliche Releases und persistenten Speicher
- Plesk-Verhalten für `Host`, `X-Forwarded-Host`, Client-IP und HTTPS-Erkennung
- Domain-/Alias-Zuordnung und SSL-Zertifikat je Host
- MySQL-/MariaDB-Version, Verbindungsgrenzen und Backupaufbewahrung
- SMTP-Anbieter, Absenderfreigabe und Zustelltests
- Scheduler-Intervall und sichere Variablenübergabe
- externer Medienspeicher
- Monitoring, Alarmweg, Log-Aufbewahrung und verantwortliche Person

DNS, SSL, echte Secrets, reale Kundendaten und das tatsächliche Deployment bleiben bewusste manuelle Schritte.
