# FahrSeiten auf netcup/Plesk in Betrieb nehmen

Stand: 17. September 2026. Diese Checkliste beschreibt die einmalige Plattforminstallation auf `fahrseiten.de`. Neue Fahrschulen werden danach als Mandanten in derselben Anwendung und derselben Datenbank angelegt. Es gibt keinen separaten Code- oder Datenbankinstaller je Fahrschule.

## Was der Installer übernimmt

Der Browserassistent unter `/setup` fragt MySQL-/MariaDB-Host beziehungsweise IP, Port, Datenbankname, Benutzer und Passwort ab. Er prüft die Verbindung, wendet alle versionierten Migrationen an und legt den ersten Plattform-Owner, Plattformstammdaten, Design, Wartungsmodus sowie Entwürfe für Impressum und Datenschutz an. Die Verbindung wird anschließend mit Dateimodus `0600` in einer persistenten Runtime-Datei außerhalb des Release-Verzeichnisses gespeichert.

Das vollständige Schema liegt zusätzlich als `schema/fahrseiten-schema.sql` im erzeugten Standalone-Build. Es ist nur ein Fallback für eine nachweislich leere Datenbank. Bei der normalen Erstinstallation wird es nicht manuell importiert. Bei Updates darf es niemals importiert werden; dort wird ausschließlich `node migrate.mjs` ausgeführt.

## Vor der Mittagspause bereitlegen

- Zugang zu GitHub Desktop und zum GitHub-Repository
- Zugang zum netcup Customer Control Panel und Webhosting Control Panel
- tatsächliche Webserver-IPv4 und gegebenenfalls IPv6 aus der netcup-Webhostingübersicht
- tatsächlichen internen MySQL-Host aus derselben Übersicht
- eine neue leere MySQL-/MariaDB-Datenbank und einen ausschließlich ihr zugeordneten Benutzer
- ein Mailpostfach wie `noreply@fahrseiten.de` und den im WCP angezeigten SMTP-Host
- Anbieter-, Vertretungs-, Anschrift-, Kontakt-, Register- und gegebenenfalls Aufsichtsdaten für die Rechtstextentwürfe
- eine getrennte, rechtliche Prüfung der erzeugten Entwürfe vor Veröffentlichung

Keine Zugangsdaten in Git, GitHub Actions, den Build, Screenshots oder diese Dokumentation eintragen.

## 1. Technische Voraussetzungen prüfen

1. Im WCP bei `fahrseiten.de` prüfen, ob die Node.js-Funktion vorhanden ist.
2. Prüfen, ob **Node.js 22.x** auswählbar ist.
3. Prüfen, ob eine eigene Startdatei, Umgebungsvariablen und ein Application Root gesetzt werden können.
4. Prüfen, ob über SSH oder eine gleichwertige Plesk-Funktion `node migrate.mjs` ausgeführt werden kann.
5. Wenn einer dieser Punkte fehlt, hier stoppen und den netcup-Support um Freischaltung beziehungsweise Bestätigung bitten. Ein PHP-only-Upload kann diese Anwendung nicht starten.

## 2. GitHub-Repository in Plesk verbinden

1. Den abgeschlossenen lokalen Commit mit GitHub Desktop über **Push origin** nach `main` übertragen.
2. In Plesk **Websites & Domains > Git > Add Repository** öffnen.
3. **Remote Git hosting** auswählen und `https://github.com/ENJOMEDIA/fahrseiten.git` eintragen.
4. Als aktiven Branch `main` und als Deploymentpfad `fahrseiten.de` wählen.
5. **Manual deployment** einstellen. Ein Git-Push soll die laufende Seite nicht automatisch verändern.
6. **Additional deployment actions** deaktivieren beziehungsweise das Feld leer lassen. Bei gesperrtem SSH-Zugriff führt Plesk diese Aktionen in einer chroot-Umgebung ohne Zugriff auf die Node.js-Toolkit-Binärdatei aus.
7. **Pull Updates** und anschließend **Deploy from Repository** anklicken. Dieser Schritt überträgt nur die versionierten Dateien.

Der GitHub-Workflow **Plesk-Artefakt** ist für diesen Weg nicht erforderlich. Er bleibt als optionaler Fallback verfügbar. Der produktive Build entsteht direkt auf dem Linux-Webhosting und nicht auf dem Mac.

## 3. Datenbank in Plesk anlegen

1. Im WCP **Websites & Domains > Databases/Datenbanken > Add Database/Datenbank hinzufügen** öffnen.
2. Eine leere Datenbank, beispielsweise `fahrseiten_prod`, anlegen. Plesk kann dem Namen einen Kontopräfix voranstellen; anschließend immer den tatsächlich angezeigten Namen verwenden.
3. Gleichzeitig einen eigenen Datenbankbenutzer nur für diese Datenbank anlegen und ein zufälliges Passwort erzeugen.
4. Den **internen MySQL-Host** aus der netcup-Webhostingübersicht verwenden. Nicht ungeprüft `localhost` einsetzen.
5. Host beziehungsweise IP, Port, vollständigen Datenbanknamen, Benutzer und Passwort für den späteren Setup-Dialog bereithalten. Der Installer kodiert daraus selbst die MySQL-Verbindungs-URL.
6. Noch keinen Demo-Seed und keinen SQL-Import ausführen.

## 4. Build und persistenten Pfad prüfen

1. Im Plesk-Dateimanager den Git-Deploymentpfad `fahrseiten.de` öffnen und prüfen, dass dort `package.json`, `pnpm-lock.yaml` und `plesk-start.mjs` liegen.
2. Keine `.env`-Datei anlegen und keine Secrets in Dateien innerhalb von `fahrseiten.de` schreiben.
3. Außerhalb des Git- und Application-Root einen persistenten, für den Hosting-Systembenutzer beschreibbaren Pfad verwenden. Ohne abweichende Konfiguration nutzt FahrSeiten `<Hosting-Home>/.fahrseiten/runtime.json`.
4. Dieser Pfad und die Datenbank werden durch spätere Git-Pulls und Builds nicht überschrieben.

## 5. Node.js-Anwendung konfigurieren

In Plesk für `fahrseiten.de` eintragen:

| Feld             | Wert                   |
| ---------------- | ---------------------- |
| Node.js-Version  | `22.x`                 |
| Application Mode | `production`           |
| Application Root | `fahrseiten.de`        |
| Document Root    | `fahrseiten.de/public` |
| Startup File     | `plesk-start.mjs`      |

Als Paketmanager `pnpm` auswählen und zuerst über die Plesk-Schaltfläche **Pakete installieren** ausführen. Danach über **Skript ausführen** das Skript `deploy:plesk` starten. Das Skript prüft die installierten Abhängigkeiten, ohne einen verschachtelten zweiten pnpm-Prozess zu öffnen. Nur fortfahren, wenn der Lauf mit `Plesk-Artefakt geprüft` erfolgreich endet. Anschließend muss unter `fahrseiten.de/dist/plesk` der vollständige Build mit `app.mjs`, `server.js`, `public/`, `.next/`, `drizzle/` und `schema/` liegen.

Antwortet die Domain danach bereits vor der Next.js-Routenauflösung mit HTTP 500, über **Skript ausführen** `diagnose:plesk` starten. Die Ausgabe prüft Build und Pfade; Plesk reicht die Anwendungsvariablen je nach Version nicht an Paket-Skripte weiter. Nach **Restart App** enthält `fahrseiten.de/plesk-startup-error.log` die bereinigte Startursache. Die Datei liegt außerhalb des Document Root, erhält Modus `0600` und enthält keine Secret-Werte. Erst nach Behebung der dort genannten Ursache erneut starten.

Die Werte aus `ENVIRONMENT.example.txt` einzeln als geschützte Plesk-Umgebungsvariablen anlegen. `FAHRSEITEN_CONFIG_FILE` erhält den zuvor festgelegten absoluten persistenten Pfad. Wird die Variable ausgelassen, verwendet die Produktion `$HOME/.fahrseiten/runtime.json`. Für zwei getrennte Zufallswerte kann lokal jeweils folgender Befehl verwendet werden:

```bash
openssl rand -hex 32
```

Einen Wert als `CRON_SECRET`, den anderen als vorübergehenden `INSTALL_TOKEN` hinterlegen. `APP_BASE_URL` bleibt bereits `https://fahrseiten.de`, auch wenn das Zertifikat erst nach dem DNS-Wechsel ausgestellt wird. Die App darf gestartet werden. Auf ausdrücklichen Wunsch kann `/setup` schon über HTTP verwendet werden; Installationscode, Admin-Passwort und Stammdaten werden dabei unverschlüsselt übertragen.

`CONSENT_FUNCTIONAL_SERVICES`, `CONSENT_STATISTICS_SERVICES` und `CONSENT_MARKETING_SERVICES` bleiben leer, solange kein entsprechender optionaler Dienst technisch eingebunden ist. Dadurch erscheint kein unnötiges Consent-Banner.

## 6. Domains in Plesk zuordnen

1. `fahrseiten.de` als Hauptdomain der Node.js-Anwendung verwenden.
2. `www.fahrseiten.de` als Alias beziehungsweise zusätzliche Domain derselben Anwendung zuordnen.
3. Login und Verwaltung zunächst unter `fahrseiten.de/login`, `/admin` und `/kunde` verwenden.
4. `app.fahrseiten.de` erst später als optionalen Alias derselben Anwendung ergänzen; keine zweite Node.js-Installation anlegen.
5. Bei den aktiven Hosts prüfen, dass Plesk den `Host`-Header erhält. `TRUST_PROXY_HEADERS` bleibt zunächst `false`.

## 7. DNS durch netcup setzen lassen

Die Zielwerte stehen im CCP in der Webhostingübersicht. An netcup kann folgende Liste mit den echten Zielwerten übergeben werden:

| Host  | Typ     | Ziel                                                  |
| ----- | ------- | ----------------------------------------------------- |
| `@`   | `A`     | tatsächliche Webserver-IPv4                           |
| `www` | `CNAME` | `fahrseiten.de`                                       |
| `app` | `CNAME` | Erst bei späterer Einrichtung von `app.fahrseiten.de` |

Falls netcup für das Produkt ausdrücklich IPv6 ausweist und sie korrekt auf dasselbe Webhosting zeigt, zusätzlich `AAAA` für `@`, `www` und `app` setzen. Keine alte oder unbestätigte IPv6-Adresse stehen lassen, weil ein Teil der Besucher sonst am neuen Server vorbeigeleitet werden kann.

Vorhandene `MX`-, SPF-, DKIM- und DMARC-Einträge für E-Mail nicht löschen oder durch Webserverwerte ersetzen. Für einen Host mit `CNAME` dürfen keine konkurrierenden `A`-, `AAAA`- oder weiteren Einträge bestehen. Wenn netcup statt CNAME eigene A/AAAA-Werte vorgibt, gelten die im CCP für genau dieses Webhosting angezeigten Zieladressen.

Nach der Rückmeldung von netcup prüfen:

```bash
dig +short fahrseiten.de A
dig +short www.fahrseiten.de CNAME
dig +short fahrseiten.de MX
```

Erst weitergehen, wenn die Webhosts auf das vorgesehene Webhosting zeigen und die Mailrecords noch korrekt vorhanden sind.

## 8. SSL/TLS ausstellen

1. Im WCP **Websites & Domains > fahrseiten.de > SSL/TLS Certificates** öffnen.
2. Ein kostenloses Let’s-Encrypt-Basiszertifikat für `fahrseiten.de` installieren und `www` einschließen.
3. `app.fahrseiten.de` erst dann in ein Zertifikat aufnehmen, wenn die optionale Subdomain tatsächlich eingerichtet wird.
4. Im Browser jeden aktiven Host einzeln mit `https://` aufrufen und Zertifikatsname sowie Gültigkeit prüfen.
5. Erst danach **Redirect from HTTP to HTTPS** aktivieren.
6. HSTS erst aktivieren, wenn alle benötigten Hosts dauerhaft per HTTPS funktionieren; ein Fehler lässt sich für Besucher dann nicht mehr per HTTP umgehen.

Ein Wildcard-Zertifikat ist für diesen ersten Start nicht nötig. netcup weist darauf hin, dass ein Wildcard-Zertifikat zusätzliche DNS-Schritte benötigt und die automatische Verlängerung erschweren kann.

## 9. Plattform einmalig installieren

1. Vor der SSL-Freigabe `http://fahrseiten.de/api/health`, danach `https://fahrseiten.de/api/health` aufrufen; erwartet wird `status: ok`.
2. Für den gewünschten Vorabstart `http://fahrseiten.de/setup` öffnen. Sobald SSL funktioniert, ausschließlich `https://fahrseiten.de/setup` verwenden. HTTP nur von einem vertrauenswürdigen eigenen Gerät und Netz aus benutzen.
3. Den nur in Plesk hinterlegten `INSTALL_TOKEN` eingeben.
4. Internen Datenbankhost beziehungsweise IP, Port, vollständigen Datenbanknamen, Benutzer und Passwort aus Plesk eingeben.
5. Plattform- und Owner-Daten, Wartungsvorschautext, Markenfarben sowie rechtliche Grunddaten eintragen. Die erzeugten Rechtstexte bleiben prüfpflichtige Entwürfe.
6. Installation absenden. Der Assistent prüft die Verbindung, migriert die leere Datenbank und legt Grunddaten atomar an.
7. Bei Erfolg enthält die persistente Runtime-Datei nur die Datenbankverbindung, Konfigurationsversion und Abschlusszeit. Der `INSTALL_TOKEN` wird nicht übernommen und ist wegen der Installationssperre dauerhaft verworfen.
8. Die Node.js-Anwendung in Plesk einmal neu starten, damit alle Servermodule die neue Datenbankverbindung laden.
9. Danach zunächst über dasselbe Protokoll `/api/ready` prüfen; erwartet werden `status: ready` und `database: ok`.
10. Ein zweiter Aufruf von `/setup` darf auch mit dem weiterhin in Plesk gesetzten Token keine zweite Installation erzeugen. Die Umgebungsvariable kann später zur Ordnung entfernt werden, ist dafür aber nicht mehr sicherheitsentscheidend.

Falls `/setup` technisch nicht nutzbar ist, vorübergehend `INSTALL_OWNER_EMAIL`, `INSTALL_OWNER_NAME` und `INSTALL_OWNER_PASSWORD` als geschützte Plesk-Variablen setzen und im erzeugten Verzeichnis `fahrseiten.de/dist/plesk` `node install.mjs` ausführen. Der Shell-Installer migriert das Schema und legt ausschließlich den ersten Plattform-Owner an. Danach die drei Variablen sofort entfernen und die Anwendung neu starten. Plattformstammdaten, Design, Wartungstext und Rechtstextentwürfe werden auf diesem Notfallweg nicht angelegt; deshalb bleibt der Browserassistent der vorgesehene Installationsweg. Der SQL-Fallback wird nur für eine leere Datenbank verwendet.

## 10. SMTP für Akquise und Systemmails einrichten

1. In Plesk ein eigenes Postfach, beispielsweise `noreply@fahrseiten.de`, mit zufälligem Passwort anlegen.
2. Den **SMTP(S)-Host aus der netcup-Webhostingübersicht** übernehmen; nicht raten.
3. Port und Verschlüsselungsart aus dem WCP übernehmen. Typisch ist entweder implizites TLS mit `SMTP_SECURE=true` oder STARTTLS mit `SMTP_SECURE=false`; maßgeblich sind die angezeigten netcup-Werte.
4. In Plesk `SMTP_MODE=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` und `SMTP_FROM` setzen.
5. App neu starten.
6. SPF, DKIM und DMARC im CCP/WCP prüfen. Bestehende Werte nicht durch pauschale Beispiele ersetzen.

Akquiseanfragen der FahrSeiten-Landingpage werden bereits im internen Akquise-CRM gespeichert. SMTP verarbeitet die vorhandene Benachrichtigungswarteschlange; eine separate automatische E-Mail für jede neue Vertriebsanfrage ist im aktuellen Stand noch nicht verbunden. Neue Leads sind deshalb zunächst unter `/admin/akquise` zu kontrollieren.

## 11. Scheduler aktivieren

1. In Plesk **Scheduled Tasks/Geplante Aufgaben** öffnen.
2. Eine Aufgabe **Run a command/Befehl ausführen** für den Hosting-Systembenutzer anlegen.
3. Als Befehl den vom WCP gültigen Node-Pfad plus Releasepfad verwenden, beispielsweise sinngemäß:

   ```text
   node fahrseiten.de/dist/plesk/cron.mjs
   ```

4. Mit einem Intervall von fünf Minuten starten.
5. Prüfen, wie Plesk die App-Umgebungsvariablen an Scheduled Tasks übergibt. `APP_BASE_URL` und `CRON_SECRET` müssen vorhanden sein, dürfen aber nicht als sichtbare Kommandozeilenargumente erscheinen.
6. **Run Now/Jetzt ausführen** verwenden. Nur bei erfolgreichem Testlauf aktiv lassen.

Plesk führt Linux-Aufgaben je nach Tarif in einer eingeschränkten Umgebung aus. Bei `node: command not found` oder fehlenden Variablen stoppen und den im WCP vorgesehenen Node-Pfad beziehungsweise netcup-Support verwenden.

## 12. Wartungsmodus, Rechtstexte und Freigabe

1. Unter `/admin/rechtliches` Impressum und Datenschutz an die tatsächliche Hosting-, SMTP-, Kontakt- und Verarbeitungsumgebung anpassen.
2. Texte rechtlich prüfen lassen und erst danach veröffentlichen.
3. Unter `/admin/einstellungen` Vorschautext und Wartungsstatus prüfen.
4. Solange die Seite nur als Sneak Preview erreichbar sein soll, Wartungsmodus aktiviert lassen.
5. Die öffentliche Freigabe ist erst möglich, wenn Impressum und Datenschutz veröffentlicht sind.
6. Cookie-Einstellungen mit leerer optionaler Diensteliste prüfen. Erst beim späteren Einsatz echter optionaler Dienste die passende Kategorie benennen und das Laden technisch an eine Einwilligung binden.

## 13. Abnahme

- `/api/health` antwortet mit HTTP 200.
- `/api/ready` antwortet mit HTTP 200 und Datenbankstatus `ok`.
- `fahrseiten.de` und `www.fahrseiten.de` zeigen die Wartungsvorschau.
- `fahrseiten.de/login` zeigt den Login und der Plattform-Owner kann sich anmelden.
- `/setup` kann keine zweite Installation erzeugen.
- `/admin/akquise`, `/admin/einstellungen` und `/admin/rechtliches` sind nur mit passender Rolle erreichbar.
- Impressum, Datenschutz und Cookie-Einstellungen sind aus der Vorschauseite erreichbar.
- Plesk-Logs enthalten keine Zugangsdaten oder personenbezogenen Formularinhalte.
- Der Scheduler-Test läuft ohne Fehler.
- Ein Datenbankexport lässt sich außerhalb des öffentlich erreichbaren Document Root ablegen.

## 14. Sichere Updates ohne Überschreiben

Ein Git-Push ändert auf dem Server zunächst nichts. Erst **Pull Updates** und **Deploy from Repository** aktualisieren den Build, weil in Plesk der manuelle Deploymentmodus eingestellt ist.

1. Vor jedem Update einen Plesk-Datenbankexport außerhalb des Document Root erstellen.
2. Prüfen, dass die GitHub-Checks des gewünschten `main`-Commits erfolgreich sind.
3. In Plesk **Pull Updates** und danach **Deploy from Repository** ausführen.
4. Im Node.js-Toolkit zuerst **Pakete installieren** und danach über **Skript ausführen** `deploy:plesk` starten.
5. Nur fortfahren, wenn das Node.js-Toolkit-Skript erfolgreich endet.
6. Im Verzeichnis `fahrseiten.de/dist/plesk` einmal `node migrate.mjs` ausführen. Das Skript liest die Datenbankverbindung aus `FAHRSEITEN_CONFIG_FILE` beziehungsweise dem persistenten Standardpfad.
7. Bei einem Migrationsfehler sofort stoppen und die Anwendung nicht neu starten.
8. Die Node.js-Anwendung neu starten und Health, Readiness, Login, Wartungsvorschau und Scheduler prüfen.
9. Bei einem reinen Codefehler den betroffenen Commit ohne Force-Push mit `git revert` rückgängig machen, erneut pullen, deployen und neu starten. Bei einer nicht rückwärtskompatiblen Migration ist zusätzlich das unmittelbar davor erstellte Datenbankbackup erforderlich.

Die Datenbank und ihre geschützte Runtime-Konfiguration liegen außerhalb von `fahrseiten.de` und werden nicht durch einen Pull oder Build überschrieben. Das SQL-Gesamtschema wird bei Updates nicht importiert. Produktive Medienuploads bleiben bis zur Freigabe eines persistenten Speicheradapters deaktiviert beziehungsweise außerhalb des Git-Verzeichnisses zu planen; `.local-storage` ist nur für lokale Entwicklung vorgesehen.

## Offizielle Referenzen

- [netcup: Webhosting Interface mit Webserver-, MySQL- und SMTP-Zielwerten](https://www.netcup.com/de/helpcenter/dokumentation/webhosting/interface)
- [netcup: DNS-Einstellungen für Bestandsdomains](https://www.netcup.com/de/helpcenter/dokumentation/domain/dns-einstellungen)
- [netcup: DNS Records für Webhosting](https://www.netcup.com/en/helpcenter/documentation/web-hosting/webhosting-dns)
- [netcup: SSL/TLS mit Let’s Encrypt](https://www.netcup.com/en/helpcenter/documentation/web-hosting/enabling-ssl-tls)
- [Plesk: Node.js-Anwendungen hosten](https://docs.plesk.com/de-DE/obsidian/administrator-guide/websiteverwaltung/hosten-von-nodejsanwendungen.76652/)
- [Plesk: Remote-Git-Hosting verbinden und manuell deployen](https://docs.plesk.com/en-US/obsidian/customer-guide/git-support/using-remote-git-hosting.75848/)
- [Plesk: Datenbanken anlegen](https://docs.plesk.com/en-US/obsidian/customer-guide/website-databases/creating-databases.65157/)
- [Plesk: Geplante Aufgaben](https://docs.plesk.com/en-US/obsidian/administrator-guide/server-administration/scheduling-tasks.64993/)
