# FahrSeiten auf netcup/Plesk in Betrieb nehmen

Stand: 17. September 2026. Diese Checkliste beschreibt die einmalige Plattforminstallation auf `fahrseiten.de`. Neue Fahrschulen werden danach als Mandanten in derselben Anwendung und derselben Datenbank angelegt. Es gibt keinen separaten Code- oder Datenbankinstaller je Fahrschule.

## Was der Installer übernimmt

Der Browserassistent unter `https://fahrseiten.de/setup` verbindet sich über die bereits in Plesk hinterlegte `DATABASE_URL` mit MySQL/MariaDB. Er wendet alle versionierten Migrationen an und legt den ersten Plattform-Owner, Plattformstammdaten, Design, Wartungsmodus sowie Entwürfe für Impressum und Datenschutz an.

Das vollständige Schema liegt zusätzlich als `schema/fahrseiten-schema.sql` im Deployment-Artefakt. Es ist nur ein Fallback für eine nachweislich leere Datenbank. Bei der normalen Erstinstallation wird es nicht manuell importiert. Bei Updates darf es niemals importiert werden; dort wird ausschließlich `node migrate.mjs` ausgeführt.

## Vor der Mittagspause bereitlegen

- Zugang zu GitHub Desktop und zum GitHub-Repository
- Zugang zum netcup Customer Control Panel und Webhosting Control Panel
- tatsächliche Webserver-IPv4 und gegebenenfalls IPv6 aus der netcup-Webhostingübersicht
- tatsächlichen internen MySQL-Host aus derselben Übersicht
- eine neue leere MySQL-/MariaDB-Datenbank und einen ausschließlich ihr zugeordneten Benutzer
- ein Mailpostfach wie `noreply@fahrseiten.de` und den im WCP angezeigten SMTP-Host
- Anbieter-, Vertretungs-, Anschrift-, Kontakt-, Register- und gegebenenfalls Aufsichtsdaten für die Rechtstextentwürfe
- eine getrennte, rechtliche Prüfung der erzeugten Entwürfe vor Veröffentlichung

Keine Zugangsdaten in Git, GitHub Actions, das Artefakt, Screenshots oder diese Dokumentation eintragen.

## 1. Technische Voraussetzungen prüfen

1. Im WCP bei `fahrseiten.de` prüfen, ob die Node.js-Funktion vorhanden ist.
2. Prüfen, ob **Node.js 22.x** auswählbar ist.
3. Prüfen, ob eine eigene Startdatei, Umgebungsvariablen und ein Application Root gesetzt werden können.
4. Prüfen, ob über SSH oder eine gleichwertige Plesk-Funktion `node migrate.mjs` ausgeführt werden kann.
5. Wenn einer dieser Punkte fehlt, hier stoppen und den netcup-Support um Freischaltung beziehungsweise Bestätigung bitten. Ein PHP-only-Upload kann diese Anwendung nicht starten.

## 2. Geprüftes Linux-Artefakt erzeugen

1. Den abgeschlossenen lokalen Commit mit GitHub Desktop über **Push origin** übertragen.
2. Auf GitHub unter **Actions** den Workflow **Plesk-Artefakt** öffnen.
3. **Run workflow** für den gewünschten Branch starten.
4. Nur fortfahren, wenn alle Prüfungen grün sind.
5. Das Artefakt `fahrseiten-plesk-<vollständiger-commit-hash>` herunterladen und lokal entpacken. Darin liegt ein `fahrseiten-plesk-<kurzer-hash>.tar.gz`.

Kein auf macOS erzeugtes `.next/standalone` auf das Linux-Webhosting kopieren.

## 3. Datenbank in Plesk anlegen

1. Im WCP **Websites & Domains > Databases/Datenbanken > Add Database/Datenbank hinzufügen** öffnen.
2. Eine leere Datenbank, beispielsweise `fahrseiten_prod`, anlegen. Plesk kann dem Namen einen Kontopräfix voranstellen; anschließend immer den tatsächlich angezeigten Namen verwenden.
3. Gleichzeitig einen eigenen Datenbankbenutzer nur für diese Datenbank anlegen und ein zufälliges Passwort erzeugen.
4. Den **internen MySQL-Host** aus der netcup-Webhostingübersicht verwenden. Nicht ungeprüft `localhost` einsetzen.
5. Die Verbindungs-URL nur lokal zusammensetzen:

   ```text
   mysql://DB-BENUTZER:URL-KODIERTES-PASSWORT@INTERNER-MYSQL-HOST:3306/DB-NAME
   ```

6. Sonderzeichen im Benutzernamen, Passwort und Datenbanknamen URL-kodieren. Die URL anschließend ausschließlich als geschützte Plesk-Umgebungsvariable `DATABASE_URL` speichern.
7. Noch keinen Demo-Seed und keinen SQL-Import ausführen.

## 4. Release-Verzeichnis hochladen

Jedes Deployment kommt in ein neues Verzeichnis. Dadurch überschreibt ein späterer Push keine laufenden Dateien.

1. Unter dem Hostingkonto ein Verzeichnis nach dem Muster `releases/fahrseiten-<kurzer-commit-hash>` erstellen.
2. Das innere `fahrseiten-plesk-<kurzer-hash>.tar.gz` dort hochladen und genau in dieses Verzeichnis entpacken.
3. Prüfen, dass dort direkt `app.mjs`, `server.js`, `public/`, `.next/`, `drizzle/`, `schema/`, `GO-LIVE.md` und `ENVIRONMENT.example.txt` liegen.
4. Keine `.env`-Datei hochladen und keine Secrets in Dateien im Release-Verzeichnis schreiben.
5. Das vorherige Release bei späteren Updates zunächst behalten.

## 5. Node.js-Anwendung konfigurieren

In Plesk für `fahrseiten.de` eintragen:

| Feld             | Wert                                              |
| ---------------- | ------------------------------------------------- |
| Node.js-Version  | `22.x`                                            |
| Application Mode | `production`                                      |
| Application Root | `releases/fahrseiten-<kurzer-commit-hash>`        |
| Document Root    | `releases/fahrseiten-<kurzer-commit-hash>/public` |
| Startup File     | `app.mjs`                                         |

Die Werte aus `ENVIRONMENT.example.txt` einzeln als geschützte Plesk-Umgebungsvariablen anlegen. Für zwei getrennte Zufallswerte kann lokal jeweils folgender Befehl verwendet werden:

```bash
openssl rand -hex 32
```

Einen Wert als `CRON_SECRET`, den anderen als vorübergehenden `INSTALL_TOKEN` hinterlegen. `APP_BASE_URL` bleibt bereits `https://fahrseiten.de`, auch wenn das Zertifikat erst nach dem DNS-Wechsel ausgestellt wird. Die App darf gestartet werden; `/setup` wird bis zum funktionierenden HTTPS noch nicht benutzt.

`CONSENT_FUNCTIONAL_SERVICES`, `CONSENT_STATISTICS_SERVICES` und `CONSENT_MARKETING_SERVICES` bleiben leer, solange kein entsprechender optionaler Dienst technisch eingebunden ist. Dadurch erscheint kein unnötiges Consent-Banner.

## 6. Domains in Plesk zuordnen

1. `fahrseiten.de` als Hauptdomain der Node.js-Anwendung verwenden.
2. `www.fahrseiten.de` als Alias beziehungsweise zusätzliche Domain derselben Anwendung zuordnen.
3. `app.fahrseiten.de` als Subdomain anlegen und ebenfalls auf dieselbe Anwendung beziehungsweise denselben Application Root führen.
4. Keine HTTP-Weiterleitung von `app.fahrseiten.de` auf `fahrseiten.de` einrichten. Die Anwendung benötigt den ursprünglichen Hostnamen für die Bereichs- und spätere Tenant-Auflösung.
5. Bei allen drei Hosts prüfen, dass Plesk den `Host`-Header erhält. `TRUST_PROXY_HEADERS` bleibt zunächst `false`.

## 7. DNS durch netcup setzen lassen

Die Zielwerte stehen im CCP in der Webhostingübersicht. An netcup kann folgende Liste mit den echten Zielwerten übergeben werden:

| Host  | Typ     | Ziel                        |
| ----- | ------- | --------------------------- |
| `@`   | `A`     | tatsächliche Webserver-IPv4 |
| `www` | `CNAME` | `fahrseiten.de`             |
| `app` | `CNAME` | `fahrseiten.de`             |

Falls netcup für das Produkt ausdrücklich IPv6 ausweist und sie korrekt auf dasselbe Webhosting zeigt, zusätzlich `AAAA` für `@`, `www` und `app` setzen. Keine alte oder unbestätigte IPv6-Adresse stehen lassen, weil ein Teil der Besucher sonst am neuen Server vorbeigeleitet werden kann.

Vorhandene `MX`-, SPF-, DKIM- und DMARC-Einträge für E-Mail nicht löschen oder durch Webserverwerte ersetzen. Für einen Host mit `CNAME` dürfen keine konkurrierenden `A`-, `AAAA`- oder weiteren Einträge bestehen. Wenn netcup statt CNAME eigene A/AAAA-Werte vorgibt, gelten die im CCP für genau dieses Webhosting angezeigten Zieladressen.

Nach der Rückmeldung von netcup prüfen:

```bash
dig +short fahrseiten.de A
dig +short www.fahrseiten.de CNAME
dig +short app.fahrseiten.de CNAME
dig +short fahrseiten.de MX
```

Erst weitergehen, wenn die Webhosts auf das vorgesehene Webhosting zeigen und die Mailrecords noch korrekt vorhanden sind.

## 8. SSL/TLS ausstellen

1. Im WCP **Websites & Domains > fahrseiten.de > SSL/TLS Certificates** öffnen.
2. Ein kostenloses Let’s-Encrypt-Basiszertifikat für `fahrseiten.de` installieren und `www` einschließen.
3. Für `app.fahrseiten.de` über dessen SSL/TLS-Bereich ein eigenes Let’s-Encrypt-Zertifikat installieren.
4. Im Browser jeden Host einzeln mit `https://` aufrufen und Zertifikatsname sowie Gültigkeit prüfen.
5. Erst danach **Redirect from HTTP to HTTPS** aktivieren.
6. HSTS erst aktivieren, wenn alle benötigten Hosts dauerhaft per HTTPS funktionieren; ein Fehler lässt sich für Besucher dann nicht mehr per HTTP umgehen.

Ein Wildcard-Zertifikat ist für diesen ersten Start nicht nötig. netcup weist darauf hin, dass ein Wildcard-Zertifikat zusätzliche DNS-Schritte benötigt und die automatische Verlängerung erschweren kann.

## 9. Plattform einmalig installieren

1. `https://fahrseiten.de/api/health` aufrufen; erwartet wird `status: ok`.
2. `https://fahrseiten.de/setup` öffnen.
3. Den nur in Plesk hinterlegten `INSTALL_TOKEN` sowie die echten Plattform- und Owner-Daten eingeben.
4. Wartungsvorschautext und Markenfarben festlegen.
5. Rechtliche Grunddaten vollständig eintragen. Die erzeugten Texte bleiben Entwürfe und sind keine Rechtsberatung.
6. Installation absenden. Der Assistent legt Schema und Grunddaten atomar an.
7. Danach `https://fahrseiten.de/api/ready` prüfen; erwartet werden `status: ready` und `database: ok`.
8. `INSTALL_TOKEN` sofort aus Plesk entfernen und die Node.js-Anwendung neu starten.
9. Ein zweiter Aufruf von `/setup` darf keine zweite Plattforminstallation erzeugen.

Falls `/setup` technisch nicht nutzbar ist, vorübergehend `INSTALL_OWNER_EMAIL`, `INSTALL_OWNER_NAME` und `INSTALL_OWNER_PASSWORD` als geschützte Plesk-Variablen setzen und im Application Root `node install.mjs` ausführen. Der Shell-Installer migriert das Schema und legt ausschließlich den ersten Plattform-Owner an. Danach die drei Variablen sofort entfernen und die Anwendung neu starten. Plattformstammdaten, Design, Wartungstext und Rechtstextentwürfe werden auf diesem Notfallweg nicht angelegt; deshalb bleibt der Browserassistent der vorgesehene Installationsweg. Der SQL-Fallback wird nur für eine leere Datenbank verwendet.

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
   node releases/fahrseiten-<kurzer-commit-hash>/cron.mjs
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
- `app.fahrseiten.de/login` zeigt den Login und der Plattform-Owner kann sich anmelden.
- `/setup` kann keine zweite Installation erzeugen.
- `/admin/akquise`, `/admin/einstellungen` und `/admin/rechtliches` sind nur mit passender Rolle erreichbar.
- Impressum, Datenschutz und Cookie-Einstellungen sind aus der Vorschauseite erreichbar.
- Plesk-Logs enthalten keine Zugangsdaten oder personenbezogenen Formularinhalte.
- Der Scheduler-Test läuft ohne Fehler.
- Ein Datenbankexport lässt sich außerhalb des öffentlich erreichbaren Document Root ablegen.

## 14. Sichere Updates ohne Überschreiben

Ein Git-Push ändert auf dem Server zunächst nichts. Erst ein bewusst heruntergeladenes und aktiviertes Artefakt wird live.

1. Vor jedem Update einen Plesk-Datenbankexport außerhalb des Document Root erstellen.
2. Neues GitHub-Actions-Artefakt in ein **neues** `releases/fahrseiten-<hash>`-Verzeichnis entpacken.
3. Die bisherige Anwendung weiterlaufen lassen.
4. Im neuen Release mit der bestehenden `DATABASE_URL` einmal `node migrate.mjs` ausführen.
5. Bei einem Migrationsfehler sofort stoppen; Application Root nicht umstellen.
6. Erst danach Plesk Application Root und Document Root auf das neue Release umstellen und die App neu starten.
7. Health, Readiness, Login, Wartungsvorschau und Scheduler prüfen.
8. Bei einem reinen Codefehler auf das vorherige Release zurückschalten. Bei einer nicht rückwärtskompatiblen Migration ist zusätzlich das unmittelbar davor erstellte Datenbankbackup erforderlich.
9. Alte Releases erst nach einer festgelegten Aufbewahrungsfrist löschen.

Die Datenbank liegt außerhalb der Release-Verzeichnisse und wird nicht durch einen Push überschrieben. Das SQL-Gesamtschema wird bei Updates nicht importiert. Produktive Medienuploads bleiben bis zur Freigabe eines persistenten Speicheradapters deaktiviert beziehungsweise außerhalb des Release-Verzeichnisses zu planen; `.local-storage` ist nur für lokale Entwicklung vorgesehen.

## Offizielle Referenzen

- [netcup: Webhosting Interface mit Webserver-, MySQL- und SMTP-Zielwerten](https://www.netcup.com/de/helpcenter/dokumentation/webhosting/interface)
- [netcup: DNS-Einstellungen für Bestandsdomains](https://www.netcup.com/de/helpcenter/dokumentation/domain/dns-einstellungen)
- [netcup: DNS Records für Webhosting](https://www.netcup.com/en/helpcenter/documentation/web-hosting/webhosting-dns)
- [netcup: SSL/TLS mit Let’s Encrypt](https://www.netcup.com/en/helpcenter/documentation/web-hosting/enabling-ssl-tls)
- [Plesk: Node.js-Anwendungen hosten](https://docs.plesk.com/de-DE/obsidian/administrator-guide/websiteverwaltung/hosten-von-nodejsanwendungen.76652/)
- [Plesk: Datenbanken anlegen](https://docs.plesk.com/en-US/obsidian/customer-guide/website-databases/creating-databases.65157/)
- [Plesk: Geplante Aufgaben](https://docs.plesk.com/en-US/obsidian/administrator-guide/server-administration/scheduling-tasks.64993/)
