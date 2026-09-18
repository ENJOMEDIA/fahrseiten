# Plesk-Deployment

Stand: 17. September 2026. Diese Anleitung bereitet FahrSeiten für ein Plesk-Deployment vor. Sie führt selbst keine Änderung an Hosting, DNS, SSL, Datenbank oder Produktivsystem aus. Werte in spitzen Klammern sind bewusst nicht auszufüllen und dürfen nicht committed werden.

## Bereitstellungsmodell

Plesk zieht den Branch `main` direkt aus GitHub in ein Quellverzeichnis. Der Git-Pull führt wegen der möglichen Plesk-chroot-Beschränkung keine Node-Befehle aus. Stattdessen installiert das Plesk-Node.js-Toolkit mit der für die Domain gewählten Node.js-22-Laufzeit die Abhängigkeiten und führt das Paket-Skript `deploy:plesk` aus. Unter `dist/plesk` entsteht dadurch ein eigenständig lauffähiger Next.js-Standalone-Build. Er enthält den von Next.js erzeugten Minimalserver, statische Dateien, öffentliche Assets, Drizzle-Migrationen sowie folgende Plesk-Einstiegspunkte:

- `app.mjs` validiert die Produktionskonfiguration und startet danach den erzeugten Next.js-Server.
- `install.mjs` migriert eine neue Plattformdatenbank und legt einmalig den ersten Plattform-Owner an.
- `migrate.mjs` wendet die versionierten Drizzle-Migrationen an.
- `cron.mjs` ruft den geschützten Scheduler auf, ohne das Cron-Secret in die Kommandozeile zu schreiben.
- `schema/fahrseiten-schema.sql` enthält das vollständige Schema für den optionalen Import in eine leere Datenbank.
- `GO-LIVE.md`, `DEPLOYMENT.md` und `ENVIRONMENT.example.txt` geben dem hochgeladenen Release die Schrittfolge, technische Betriebsanleitung und eine geheimnisfreie Variablenvorlage mit.
- `DEPLOYMENT.json` beschreibt Runtime und Startdatei des Artefakts.

Der Build enthält keine `.env`-Datei. Allgemeine Betriebswerte und der erste Installationscode werden als geschützte Plesk-Umgebungsvariablen hinterlegt. Der Webinstaller speichert die geprüfte Datenbankverbindung in `FAHRSEITEN_CONFIG_FILE` außerhalb des Git- und Application-Root mit Dateimodus `0600`. Ohne expliziten Pfad verwendet die Produktion `$HOME/.fahrseiten/runtime.json`.

Die vollständige Bedienreihenfolge für den ersten netcup-Livegang steht in der [Livegang-Checkliste](go-live-plesk.md). Der Installer funktioniert auch vor der SSL-Ausstellung über HTTP. In diesem Fall werden Installationscode, Admin-Passwort und Stammdaten unverschlüsselt übertragen; dies ist nur die ausdrücklich gewählte Übergangslösung bis zur netcup-DNS- und SSL-Freigabe.

## Voraussetzungen in Plesk

Vor dem ersten Deployment sind im Plesk-Panel oder beim Hostinganbieter diese Punkte zu prüfen:

1. Plesk Node.js Toolkit ist aktiv und stellt **Node.js 22.x** bereit.
2. Die Plesk-Git-Erweiterung kann das GitHub-Repository und den Branch `main` abrufen.
3. Die Anwendung läuft auf Linux und erlaubt eine benutzerdefinierte Startdatei im Application Root.
4. Eine unterstützte MySQL-/MariaDB-Datenbank samt eigenem Benutzer ist vorhanden.
5. Shell-Zugriff oder eine gleichwertige Möglichkeit zum einmaligen Ausführen von `node migrate.mjs` ist vorhanden.
6. Persistenter Speicher und Schreibrechte sind für spätere Uploads geklärt. Der lokale `.local-storage`-Adapter ist nicht als produktiver Speicher freigegeben.
7. Plesk kann alle vorgesehenen Hosts auf dieselbe Node.js-Anwendung leiten und den ursprünglichen `Host`-Header erhalten.

Fehlt Node.js 22, eine Startmöglichkeit oder der Host-Header bleibt nicht erhalten, darf das Deployment nicht fortgesetzt werden.

## Direkt aus GitHub bereitstellen

1. In **Websites & Domains > Git > Add Repository** `https://github.com/ENJOMEDIA/fahrseiten.git` als Remote-Repository eintragen.
2. Den Branch `main` und einen Quellpfad wie `fahrseiten.de` wählen.
3. **Manual deployment** auswählen. Dadurch macht ein Push die Website nicht unkontrolliert live.
4. **Additional deployment actions** deaktiviert beziehungsweise leer lassen. Bei gesperrtem SSH-Zugriff laufen diese Aktionen laut Plesk in einer chroot-Umgebung, in der die Node-Binärdatei des Toolkits nicht erreichbar sein kann.
5. Zuerst **Pull Updates**, danach **Deploy from Repository** ausführen.
6. Unter **Websites & Domains > Node.js** Node.js 22 und den vom Lockfile erkannten Paketmanager `pnpm` auswählen.
7. In Plesk einmal **Pakete installieren** ausführen. Plesk installiert damit die zum Zielsystem passenden Abhängigkeiten aus `pnpm-lock.yaml`, einschließlich der Linux-Bibliothek für die Bildoptimierung.
8. Über **Skript ausführen** das Paket-Skript `deploy:plesk` starten.

`deploy:plesk` prüft zuerst, ob die von Plesk installierten Laufzeit- und Buildabhängigkeiten vollständig vorhanden sind. Danach führt es die Plesk-Laufzeittests, den Produktions-Build, das SQL-Schema-Bundle, die Zusammenstellung des Standalone-Builds und dessen Strukturprüfung aus. Es startet absichtlich keinen zweiten Paketmanager innerhalb des Plesk-Skriptlaufs, weil dabei versionsabhängige pnpm-Konfigurationswerte kollidieren können. Bei fehlenden Paketen, einer falschen Node-Version oder einem Buildfehler bricht der Vorgang mit einer konkreten Meldung ab. Der Build entsteht direkt auf dem Linux-Zielsystem und passt zu dessen Architektur. `deploy/plesk/deploy-from-git.sh` bleibt nur für Systeme mit echtem, nicht eingeschränktem Shell-Zugriff als Alternative erhalten.

Bei einem HTTP-500-Fehler vor Erreichen der Next.js-Routen wird im Node.js-Toolkit das Paket-Skript `diagnose:plesk` ausgeführt. Es prüft Node-Version, Arbeitsverzeichnis, Buildpfade und Installationsstatus. Einige Plesk-Versionen reichen die Anwendungsvariablen nicht an Paket-Skripte weiter; in diesem Fall bewertet die Diagnose sie bewusst nicht. Die Startdatei schreibt einen bereinigten Fehlerbericht mit Dateimodus `0600` nach `plesk-startup-error.log` im nicht öffentlichen Application Root. Secret-Werte werden daraus entfernt.

Der manuell startbare GitHub-Actions-Workflow `Plesk-Artefakt` bleibt als optionaler Prüf- und Downloadweg bestehen. Für das direkte Plesk-Git-Deployment ist er nicht erforderlich.

## Plesk-Einstellungen

Für die Domain `fahrseiten.de` sind folgende Werte vorgesehen:

| Plesk-Feld               | Wert                   |
| ------------------------ | ---------------------- |
| Node.js-Version          | `22.x`                 |
| Application Mode         | `production`           |
| Application Root         | `fahrseiten.de`        |
| Document Root            | `fahrseiten.de/public` |
| Application Startup File | `plesk-start.mjs`      |

Die Plesk-Startdatei muss direkt im Application Root liegen. `plesk-start.mjs` lädt nach dem erfolgreichen Build `dist/plesk/app.mjs`; bei fehlendem Build beendet sie sich mit einer eindeutigen Meldung. Plesk beziehungsweise der vorgeschaltete Webserver übernimmt TLS und Reverse Proxy; der Node-Prozess lauscht ausschließlich auf dem von Plesk gesetzten `PORT`.

## Umgebungsvariablen

Mindestens diese Variablen werden in Plesk hinterlegt:

| Variable                      | Vorgesehener Inhalt                                                         |
| ----------------------------- | --------------------------------------------------------------------------- |
| `NODE_ENV`                    | `production`                                                                |
| `APP_BASE_URL`                | `https://fahrseiten.de`                                                     |
| `DASHBOARD_BASE_URL`          | Leer: Login unter `fahrseiten.de/login`; später optional eigene App-Domain  |
| `FAHRSEITEN_CONFIG_FILE`      | Absoluter persistenter Pfad außerhalb des Release- und Document-Root        |
| `DEMO_DATA_MODE`              | `database`                                                                  |
| `MARKETING_HOSTS`             | `fahrseiten.de,www.fahrseiten.de`                                           |
| `APP_HOSTS`                   | Leer, solange keine eigene Verwaltungs-Subdomain eingerichtet ist           |
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
| `ONLINEBRIEF_MODE`            | Zunächst `test`; `live` erst nach dokumentierter Versandfreigabe            |
| `ONLINEBRIEF_API_KEY`         | API-Key aus dem Onlinebrief24-Kundencenter                                  |
| `ONLINEBRIEF_API_SECRET`      | API-Secret aus dem Onlinebrief24-Kundencenter                               |

`DATABASE_URL` wird bei der normalen Browserinstallation nicht vorab gesetzt. Host, Port, Datenbankname, Benutzer und Passwort werden in `/setup` erfasst. `PORT` und gegebenenfalls `HOSTNAME` werden von Plesk beziehungsweise seiner Node.js-Laufzeit verwaltet. Sie dürfen nicht hart im Repository eingetragen werden. Die Startvalidierung nennt ausschließlich fehlerhafte Variablennamen oder Regeln und gibt keine Secret-Werte aus.

Für die optionale Onlinebrief24-Anbindung werden `ONLINEBRIEF_API_KEY` und
`ONLINEBRIEF_API_SECRET` ausschließlich als geschützte Plesk-Variablen
hinterlegt. `ONLINEBRIEF_MODE=test` ist die sichere Voreinstellung und legt
übertragene Briefe nur in den Onlinebrief24-Warenkorb. Erst nach einer
kontrollierten Abnahme darf `ONLINEBRIEF_MODE=live` gesetzt werden. Der
Anwendungscode verlangt im Live-Modus zusätzlich die erneute Bestätigung der
zugehörigen Lead-ID; Zugangsdaten werden weder in Git noch in der Datenbank
gespeichert.

## Domain- und Proxy-Prüfung

`fahrseiten.de` und `www.fahrseiten.de` gehören zur Marketingoberfläche. Login,
Plattformverwaltung und Kundenbereich sind zunächst über `/login`, `/admin` und
`/kunde` auf der Hauptdomain erreichbar. Eine spätere `app.fahrseiten.de`
gehört zum Plattform- und Kunden-Backend. Externe Kundendomains werden als
eigene Domains oder Aliase auf dieselbe Anwendung geführt; sie dürfen nicht per
HTTP-Weiterleitung auf `fahrseiten.de` umgebogen werden, weil die
Tenant-Auflösung den ursprünglichen Host benötigt.

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

Danach im erzeugten Verzeichnis `dist/plesk` über die Plesk-Skriptfunktion oder Shell ausführen:

```bash
node install.mjs
```

Der Shell-Installer wendet alle Migrationen an und erzeugt nur dann einen Benutzer, wenn noch kein aktiver `platform_owner` vorhanden ist. Eine bereits verwendete E-Mail wird niemals automatisch mit höheren Rechten versehen. Das Passwort wird vor dem Speichern mit demselben scrypt-Verfahren wie die Anwendung gehasht. Er erfasst keine Plattformstammdaten und ist deshalb als Wiederherstellungs- und Fallback-Weg gedacht.

Nach erfolgreichem Lauf müssen die drei `INSTALL_OWNER_*`-Variablen sofort aus Plesk entfernt werden. Sie gehören nicht zur normalen Anwendungslaufzeit. Der Installer kann danach erneut ausgeführt werden; bei vorhandenem Plattform-Owner aktualisiert er nur das Schema.

Solange keine Runtime-Datei durch den Browserinstaller vorhanden ist, muss `DATABASE_URL` für Start und Migration in Plesk gesetzt bleiben. Dieser Weg ist deshalb nur für Wiederherstellung und technische Notfälle vorgesehen.

Alternativ kann `schema/fahrseiten-schema.sql` über die Datenbankverwaltung in eine nachweislich leere Datenbank importiert werden. Anschließend wird `node install.mjs` trotzdem einmal ausgeführt, damit der erste Plattform-Owner sicher angelegt wird. Das SQL-Gesamtschema darf niemals in eine bestehende Datenbank importiert werden.

Der lokale Demo-Seed wird in Staging und Produktion niemals ausgeführt.

## Datenbankmigration bei Updates

Beim Start prüft FahrSeiten die versionierten Migrationen automatisch. Ein
Migrationskonflikt wird in `$HOME/.fahrseiten/migration-status.json`
protokolliert; der Next.js-Webserver startet trotzdem, damit Wartungsseite,
Healthcheck und Diagnose erreichbar bleiben. Bereiche, die bereits das neue
Schema benötigen, können bis zur Behebung eingeschränkt sein. Deshalb müssen
Migrationen additiv und rückwärtskompatibel geplant werden.

Der Plattform-Owner sieht denselben Status unter `/admin/system` und kann den
Lauf dort erneut anstoßen. `node migrate.mjs` bleibt als Shell-Fallback
verfügbar.

Vor jeder Migration:

1. Plesk-Datenbankexport oder gleichwertiges konsistentes Backup erstellen.
2. Zeitstempel, Datenbankname und Artefaktversion aus `DEPLOYMENT.json` protokollieren.
3. Backup-Datei außerhalb des öffentlich erreichbaren Document Root ablegen und Zugriff beschränken.
4. Wiederherstellbarkeit des Backups nach dem betrieblichen Verfahren bestätigen.
5. Im erzeugten Verzeichnis `dist/plesk` ausführen; `migrate.mjs` liest die Verbindung automatisch aus der persistenten Runtime-Datei:

```bash
node migrate.mjs
```

Bei einem Fehler werden keine Down-Migrationen oder automatischen
Rücksetzungen ausgeführt. Die Ursache muss vor einem weiteren Deployment
geklärt werden. Der Demo-Seed wird niemals in Staging oder Produktion
ausgeführt.

## Persistente Medien und Logo

Kunden laden PNG-, JPEG- oder WebP-Dateien im Kundenbereich unter
`/kunde/medien` hoch. Signatur, Größe und Abmessungen werden serverseitig
geprüft. Metadaten und Mandantenzuordnung liegen in MySQL; die Binärdateien
liegen unter `MEDIA_STORAGE_PATH`. Dieser Pfad muss außerhalb des Git- und
Application-Roots liegen, etwa `$HOME/.fahrseiten/media`, damit ein Pull oder
Build keine Uploads überschreibt.

Die öffentliche URL `/media/<UUID>` bleibt stabil und liefert kontrollierte
Cache-Header. Später kann `MEDIA_PUBLIC_BASE_URL` beispielsweise auf
`https://media.fahrseiten.de/media` zeigen. Die Medien-Subdomain muss dann als
CDN oder Reverse Proxy genau diese öffentliche Route als Origin verwenden.
Eine DNS- oder CDN-Änderung wird nicht automatisch durch die Anwendung
ausgeführt.

Seitenlogo und Favicon werden getrennt gespeichert. SVG, PNG, JPEG und WebP
sind zulässig; SVG-Dateien werden auf aktive Inhalte, externe Referenzen und
unsichere Attribute geprüft. Das Favicon wird hostabhängig über `/api/favicon`
aufgelöst, sodass FahrSeiten und jede aktive Kundendomain ein eigenes Symbol
verwenden können.

## Subdomains für die zentrale Anwendung

`app.fahrseiten.de` ist eine optionale spätere Trennung zwischen Marketing und
Verwaltung. Ohne diese Subdomain bleiben alle Kunden- und Plattformfunktionen
unter `https://fahrseiten.de/login` erreichbar. `DASHBOARD_BASE_URL` und
`APP_HOSTS` bleiben bis dahin leer.

Wenn die Subdomain später verfügbar ist, verwendet sie dieselbe Anwendung,
denselben Code und dieselbe Datenbank wie `fahrseiten.de`. In Plesk ist dafür
bevorzugt ein Domain-Alias für `fahrseiten.de` anzulegen:

1. Aliasname `app.fahrseiten.de`, Ziel `fahrseiten.de`.
2. Webservice aktivieren, Mailservice deaktivieren.
3. Keine 301-Weiterleitung auf `fahrseiten.de` aktivieren, damit der Hostname
   `app.fahrseiten.de` an Next.js erhalten bleibt.
4. Falls Plesk die DNS-Zone verwaltet, DNS-Synchronisierung aktivieren;
   andernfalls im zuständigen DNS einen A/AAAA-Eintrag auf dieselbe Hosting-IP
   oder einen CNAME auf `fahrseiten.de` setzen.
5. Das Zertifikat anschließend neu ausstellen und `app.fahrseiten.de`
   einschließen.
6. `APP_HOSTS=app.fahrseiten.de` und
   `DASHBOARD_BASE_URL=https://app.fahrseiten.de` setzen, neu bauen und die
   Node-Anwendung neu starten.

Falls Plesk den Aliasnamen als Subdomain nicht akzeptiert, wird stattdessen
`app` über **Add Subdomain** angelegt und auf denselben Application Root sowie
dieselbe Node-Startdatei geroutet. Es darf keine zweite Codekopie und kein
separater Installer verwendet werden.

`media.fahrseiten.de` ist optional. Ohne diese Subdomain werden Medien über
`https://fahrseiten.de/media/<UUID>` ausgeliefert. Für eine spätere
Medien-Subdomain gelten dieselben Alias-, DNS- und SSL-Schritte; zusätzlich wird
vor dem Build
`MEDIA_PUBLIC_BASE_URL=https://media.fahrseiten.de/media` gesetzt. Solange die
Subdomain nicht eingerichtet ist, bleibt `MEDIA_PUBLIC_BASE_URL` leer.

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
node <Application Root>/dist/plesk/cron.mjs
```

Der Scheduled Task benötigt `APP_BASE_URL` und `CRON_SECRET` in seiner geschützten Laufzeitumgebung. Das Secret darf nicht als sichtbares Kommandozeilenargument oder in einer versionierten Datei stehen. Falls Plesk die Node-Anwendungsvariablen nicht an Scheduled Tasks weitergibt, muss vor Aktivierung ein vom Hostinganbieter empfohlener geschützter Mechanismus gewählt werden.

## Update- und Rollbackablauf

Das Git-Deployment bleibt bewusst manuell. Ein Push nach GitHub ändert die laufende Website erst, wenn in Plesk **Pull Updates** und **Deploy from Repository** ausgeführt werden.

1. Vor dem Update ein konsistentes Datenbankbackup außerhalb des Document Root erstellen.
2. Sicherstellen, dass der gewünschte Commit auf `main` liegt und seine GitHub-Prüfungen erfolgreich sind.
3. In Plesk **Pull Updates** und anschließend **Deploy from Repository** ausführen.
4. Im Node.js-Toolkit das Skript `deploy:plesk` ausführen. Es installiert die Abhängigkeiten selbst und muss erfolgreich enden.
5. Im Verzeichnis `fahrseiten.de/dist/plesk` `node migrate.mjs` ausführen.
6. Bei einem Migrationsfehler sofort stoppen und die Anwendung nicht neu starten.
7. Die Node.js-Anwendung neu starten und Health-/Readiness-Checks ausführen.

Die Datenbank und `$HOME/.fahrseiten/runtime.json` liegen außerhalb des Git- und Application-Root und werden beim Pull oder Build nicht überschrieben. Bei einem reinen Codefehler wird der fehlerhafte Commit ohne Force-Push mit `git revert` rückgängig gemacht, erneut gepullt und gebaut. Enthält das Update eine nicht rückwärtskompatible Migration, reicht ein Code-Rollback nicht aus; dann ist nach dokumentierter Entscheidung das unmittelbar zuvor erstellte Datenbankbackup wiederherzustellen. Automatische destructive Down-Migrationen sind nicht vorgesehen.

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
