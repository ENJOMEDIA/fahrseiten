# Plesk-Deployment

Stand: 17. September 2026. Diese Anleitung bereitet FahrSeiten für ein Plesk-Deployment vor. Sie führt selbst keine Änderung an Hosting, DNS, SSL, Datenbank oder Produktivsystem aus. Werte in spitzen Klammern sind bewusst nicht auszufüllen und dürfen nicht committed werden.

## Bereitstellungsmodell

`pnpm build:plesk` erzeugt unter `dist/plesk` ein eigenständig lauffähiges Next.js-Standalone-Artefakt. Es enthält den von Next.js erzeugten Minimalserver, statische Dateien, öffentliche Assets, Drizzle-Migrationen sowie folgende Plesk-Einstiegspunkte:

- `app.mjs` validiert die Produktionskonfiguration und startet danach den erzeugten Next.js-Server.
- `install.mjs` migriert eine neue Plattformdatenbank und legt einmalig den ersten Plattform-Owner an.
- `migrate.mjs` wendet die versionierten Drizzle-Migrationen an.
- `cron.mjs` ruft den geschützten Scheduler auf, ohne das Cron-Secret in die Kommandozeile zu schreiben.
- `schema/fahrseiten-schema.sql` enthält das vollständige Schema für den optionalen Import in eine leere Datenbank.
- `GO-LIVE.md`, `DEPLOYMENT.md` und `ENVIRONMENT.example.txt` geben dem hochgeladenen Release die Schrittfolge, technische Betriebsanleitung und eine geheimnisfreie Variablenvorlage mit.
- `DEPLOYMENT.json` beschreibt Runtime und Startdatei des Artefakts.

Das Artefakt enthält keine `.env`-Datei. Allgemeine Betriebswerte und der erste Installationscode werden als geschützte Plesk-Umgebungsvariablen hinterlegt. Der Webinstaller speichert die geprüfte Datenbankverbindung in `FAHRSEITEN_CONFIG_FILE` außerhalb des Release-Verzeichnisses mit Dateimodus `0600`. Ohne expliziten Pfad verwendet die Produktion `$HOME/.fahrseiten/runtime.json`.

Die vollständige Bedienreihenfolge für den ersten netcup-Livegang steht in der [Livegang-Checkliste](go-live-plesk.md). Der Installer funktioniert auch vor der SSL-Ausstellung über HTTP. In diesem Fall werden Installationscode, Admin-Passwort und Stammdaten unverschlüsselt übertragen; dies ist nur die ausdrücklich gewählte Übergangslösung bis zur netcup-DNS- und SSL-Freigabe.

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

| Variable                      | Vorgesehener Inhalt                                                         |
| ----------------------------- | --------------------------------------------------------------------------- |
| `NODE_ENV`                    | `production`                                                                |
| `APP_BASE_URL`                | `https://fahrseiten.de`                                                     |
| `FAHRSEITEN_CONFIG_FILE`      | Absoluter persistenter Pfad außerhalb des Release- und Document-Root        |
| `DEMO_DATA_MODE`              | `database`                                                                  |
| `MARKETING_HOSTS`             | `fahrseiten.de,www.fahrseiten.de`                                           |
| `APP_HOSTS`                   | `app.fahrseiten.de`                                                         |
| `DEMO_HOSTS`                  | Nur tatsächlich eingerichtete Testhosts oder ein bewusst leerer Wert        |
| `TRUST_PROXY_HEADERS`         | Zunächst `false`; nur nach dokumentierter Proxy-Prüfung auf `true` setzen   |
| `SMTP_MODE`                   | `smtp`                                                                      |
| `SMTP_HOST`                   | Host des freigegebenen SMTP-Anbieters                                       |
| `SMTP_PORT`                   | Port des freigegebenen SMTP-Anbieters                                       |
| `SMTP_SECURE`                 | `true` für implizites TLS, andernfalls `false` für STARTTLS                 |
| `SMTP_USER`                   | SMTP-Benutzer, falls benötigt                                               |
| `SMTP_PASSWORD`               | SMTP-Passwort, falls benötigt                                               |
| `SMTP_FROM`                   | Freigegebener Absender, beispielsweise `FahrSeiten <noreply@fahrseiten.de>` |
| `CRON_SECRET`                 | Kryptografisch zufälliger Wert mit mindestens 24 Zeichen                    |
| `INSTALL_TOKEN`               | Nur zur Erstinstallation: zufälliger Wert mit mindestens 32 Zeichen         |
| `CONSENT_FUNCTIONAL_SERVICES` | Namen tatsächlich aktiver funktionaler Dienste oder leer                    |
| `CONSENT_STATISTICS_SERVICES` | Namen tatsächlich aktiver Statistikdienste oder leer                        |
| `CONSENT_MARKETING_SERVICES`  | Namen tatsächlich aktiver Marketingdienste oder leer                        |

`DATABASE_URL` wird bei der normalen Browserinstallation nicht vorab gesetzt. Host, Port, Datenbankname, Benutzer und Passwort werden in `/setup` erfasst. `PORT` und gegebenenfalls `HOSTNAME` werden von Plesk beziehungsweise seiner Node.js-Laufzeit verwaltet. Sie dürfen nicht hart im Repository eingetragen werden. Die Startvalidierung nennt ausschließlich fehlerhafte Variablennamen oder Regeln und gibt keine Secret-Werte aus.

## Domain- und Proxy-Prüfung

`fahrseiten.de` und `www.fahrseiten.de` gehören zur Marketingoberfläche. `app.fahrseiten.de` gehört zum Plattform- und Kunden-Backend. Externe Kundendomains werden später als eigene Domains oder Aliase auf dieselbe Anwendung geführt; sie dürfen nicht per HTTP-Weiterleitung auf `fahrseiten.de` umgebogen werden, weil die Tenant-Auflösung den ursprünglichen Host benötigt.

Nach dem ersten isolierten Stagingstart sind `Host` und `X-Forwarded-Host` mit einer Testdomain zu prüfen. `TRUST_PROXY_HEADERS=false` bleibt die sichere Voreinstellung. Eine Umstellung auf `true` ist nur zulässig, wenn Plesk eingehende Forwarded-Header überschreibt und ausschließlich den verifizierten öffentlichen Host weitergibt.

## Erstinstallation der Plattform im Browser

`INSTALL_TOKEN` wird vorübergehend als geschützte Plesk-Umgebungsvariable gesetzt. Der Wert muss kryptografisch zufällig sein, mindestens 32 Zeichen haben und darf weder im Repository noch in einer URL stehen. Nach dem Start der Anwendung wird einmalig eine der beiden Adressen aufgerufen:

```text
https://fahrseiten.de/setup
http://fahrseiten.de/setup
```

HTTPS bleibt der bevorzugte Weg. Für den ausdrücklich gewünschten Vorabstart kann HTTP verwendet werden, solange Plesk noch kein Zertifikat ausstellen kann. Der Aufruf sollte dann nur über ein vertrauenswürdiges eigenes Netz und Gerät erfolgen; öffentliche WLANs sind ungeeignet.

Der Assistent fragt den Installationscode, MySQL-/MariaDB-Host oder IP, Port, Datenbankname, Datenbankbenutzer und Datenbankpasswort sowie die FahrSeiten-Anbieter- und Kontaktdaten, den ersten Plattform-Owner mit Passwort, Primär- und Akzentfarbe, den Vorschautext und rechtliche Grundangaben ab. Beim Absenden prüft er die Datenbankverbindung und wendet alle ausstehenden Migrationen an. Anschließend werden der erste Plattform-Owner, die Plattformstammdaten und ein Audit-Eintrag angelegt.

Die öffentliche Hauptseite startet im Wartungsmodus. Auch wenn die Datenbank vor dem Setup noch nicht erreichbar ist, zeigt der Produktionsbetrieb bei `DEMO_DATA_MODE=database` auf `/` nur die neutrale FahrSeiten-Vorschau. Nach dem Login kann der Plattform-Owner Text und Freigabe unter `/admin/einstellungen` steuern. Der Installer, Login und die Administrationsrouten bleiben unabhängig davon erreichbar.

Nach erfolgreichem Abschluss schreibt der Installer ausschließlich Datenbank-URL, Konfigurationsversion und Abschlusszeitpunkt atomar in die persistente Runtime-Datei. Der `INSTALL_TOKEN` wird weder dort noch in der Datenbank gespeichert. Bei jedem späteren Aufruf erkennt die Anwendung den Abschluss vor der Tokenprüfung und verweigert eine weitere Installation; damit ist der Token anwendungsseitig verworfen, selbst wenn die Plesk-Variable noch vorhanden ist. Anschließend muss die Node.js-Anwendung einmal neu gestartet werden, damit alle Module die neue Verbindung laden. Die Route ist von Suchmaschinen ausgeschlossen und durch Same-Origin-Prüfung sowie Drosselung geschützt.

## Alternative Erstinstallation per Shell

Wenn der Browserassistent nicht verwendet werden kann, werden stattdessen vorübergehend `DATABASE_URL` sowie drei Plesk-Umgebungsvariablen für den ersten Owner gesetzt. Dieser Fallback erzeugt selbst keine persistente Runtime-Datei:

| Variable                 | Inhalt                                                 |
| ------------------------ | ------------------------------------------------------ |
| `INSTALL_OWNER_EMAIL`    | E-Mail-Adresse des ersten Plattform-Owners             |
| `INSTALL_OWNER_NAME`     | Anzeigename des ersten Plattform-Owners                |
| `INSTALL_OWNER_PASSWORD` | Ein nur dort gesetztes Passwort mit 12 bis 200 Zeichen |

Danach im Application Root über die Plesk-Skriptfunktion oder Shell ausführen:

```bash
node install.mjs
```

Der Shell-Installer wendet alle Migrationen an und erzeugt nur dann einen Benutzer, wenn noch kein aktiver `platform_owner` vorhanden ist. Eine bereits verwendete E-Mail wird niemals automatisch mit höheren Rechten versehen. Das Passwort wird vor dem Speichern mit demselben scrypt-Verfahren wie die Anwendung gehasht. Er erfasst keine Plattformstammdaten und ist deshalb als Wiederherstellungs- und Fallback-Weg gedacht.

Nach erfolgreichem Lauf müssen die drei `INSTALL_OWNER_*`-Variablen sofort aus Plesk entfernt werden. Sie gehören nicht zur normalen Anwendungslaufzeit. Der Installer kann danach erneut ausgeführt werden; bei vorhandenem Plattform-Owner aktualisiert er nur das Schema.

Solange keine Runtime-Datei durch den Browserinstaller vorhanden ist, muss `DATABASE_URL` für Start und Migration in Plesk gesetzt bleiben. Dieser Weg ist deshalb nur für Wiederherstellung und technische Notfälle vorgesehen.

Alternativ kann `schema/fahrseiten-schema.sql` über die Datenbankverwaltung in eine nachweislich leere Datenbank importiert werden. Anschließend wird `node install.mjs` trotzdem einmal ausgeführt, damit der erste Plattform-Owner sicher angelegt wird. Das SQL-Gesamtschema darf niemals in eine bestehende Datenbank importiert werden.

Der lokale Demo-Seed wird in Staging und Produktion niemals ausgeführt.

## Datenbankmigration bei Updates

Vor jeder Migration:

1. Plesk-Datenbankexport oder gleichwertiges konsistentes Backup erstellen.
2. Zeitstempel, Datenbankname und Artefaktversion aus `DEPLOYMENT.json` protokollieren.
3. Backup-Datei außerhalb des öffentlich erreichbaren Document Root ablegen und Zugriff beschränken.
4. Wiederherstellbarkeit des Backups nach dem betrieblichen Verfahren bestätigen.
5. Im neuen Application Root ausführen; `migrate.mjs` liest die Verbindung automatisch aus der persistenten Runtime-Datei:

```bash
node migrate.mjs
```

Bei einem Fehler wird nicht gestartet oder neu migriert, bis die konkrete Ursache geklärt ist. Der Demo-Seed wird niemals in Staging oder Produktion ausgeführt.

## Mandanten statt Einzelinstanzen

Neue Fahrschulen erhalten keine eigene FahrSeiten-Installation und keine eigene Datenbank. Nach der einmaligen Plattforminstallation werden sie innerhalb derselben Anwendung als getrennte Mandanten provisioniert:

1. Ein angemeldeter Plattform-Owner öffnet `/admin/mandanten/neu` und erzeugt einen Einmal-Link.
2. Der Link ist sieben Tage gültig und wird nur bei seiner Erzeugung vollständig angezeigt. In der Datenbank liegt ausschließlich sein SHA-256-Hash.
3. Die Fahrschule trägt Name, Inhaber beziehungsweise Ansprechpartner, Zugangsdaten, Adresse, Telefon, Wunschdomain, Primär- und Akzentfarbe sowie einen Vorschautext ein.
4. Der Assistent legt in einer Transaktion Tenant, `tenant_owner`, Mitgliedschaft, Website, Theme, Hauptstandort, Kontaktformular, Startseite, Navigation und Audit-Eintrag an.
5. Die Wunschdomain bleibt `pending`. DNS-Ziel, Inhabernachweis, Plesk-Alias und SSL müssen vor ihrer Aktivierung separat geprüft werden.
6. Nach Aktivierung der Domain erscheint zunächst die farblich angepasste Wartungsseite. Der `tenant_owner` kann Text und Freigabe unter `/kunde/einstellungen` steuern.

Tarifzuordnung, freigegebene Rechtstexte und weitere Designoptionen werden nicht stillschweigend vorbelegt. Diese Punkte bleiben bis zur fachlichen Entscheidung offen. Der Assistent ist ein kontrolliertes Onboarding durch die Plattformverwaltung und kein öffentliches Self-Service-Bestellsystem.

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
