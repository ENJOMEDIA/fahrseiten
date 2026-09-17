# Architekturgrundlage

Stand: 17. September 2026. Dies ist die geplante Architektur für Schritt 1; es existiert noch keine Implementierung. Verbindlicher Rahmen: [Masterprompt](FahrSeiten-Codex-Masterprompt.md) und [Laufplan](FahrSeiten-Codex-Laufplan.md). Konkrete noch offene Entscheidungen sind in [Offene Entscheidungen](open-decisions.md) erfasst.

## Zentrale Anwendung als modularer Monolith

Eine zentrale mandantenfähige Next.js-Anwendung mit App Router, React und TypeScript Strict Mode liefert alle Bereiche aus. Fachmodule trennen Verantwortlichkeiten innerhalb derselben Codebasis; das MVP erhält keine Microservice-Architektur. Tailwind CSS und ein eigenes Designsystem stellen gemeinsame Komponenten und Gestaltungsvorgaben bereit.

| Bereich                     | Kontext und Grenze                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Marketing                   | `fahrseiten.de`; öffentliche Produktinformationen und Akquiseanfragen für ENJO MEDIA                         |
| Plattform-Admin             | `app.fahrseiten.de`; Plattformrollen, Mandantenverwaltung und internes Akquise-CRM                           |
| Kunden-Admin                | `app.fahrseiten.de`; authentifizierter Benutzer mit geprüfter Mitgliedschaft im ausgewählten Mandanten       |
| Öffentliche Tenant-Websites | Zugeordnete Kundendomains und fiktive Demo; ausschließlich veröffentlichte Inhalte des aufgelösten Mandanten |
| Vorschau                    | Optionale Subdomains; Entwurfszugriff nur mit geprüfter Vorschau-Berechtigung                                |

Geplante Modulgrenzen sind Identität und Berechtigungen, Mandanten und Domains, Website/CMS, Fahrschulinhalte, Medien, Kundenanfragen, Plattform-Akquise, Tarife/Features, Benachrichtigungen/Jobs sowie Audit/Support/Consent. Transport und UI rufen serverseitige Services auf; diese verwenden eine Datenzugriffsschicht mit erzwungenem Tenant-Kontext. Konkrete Verzeichnisse, Pakete und Bibliotheken werden erst in den zuständigen Schritten festgelegt (OD-03).

## Domain- und Host-Header-basierte Tenant-Auflösung

1. Den angefragten Host über eine zentrale, testbare Schnittstelle bestimmen. Host- und Forwarded-Header sind Eingaben, keine Berechtigungsnachweise. Welche Proxy-Header vertrauenswürdig sind, wird anhand der tatsächlichen Infrastruktur festgelegt (OD-06).
2. Hostnamen normalisieren, insbesondere Kleinschreibung, Port und IDN/Punycode; ungültige oder mehrdeutige Eingaben ablehnen.
3. Bekannte Plattformdomains einem expliziten Marketing- oder Verwaltungskontext zuordnen.
4. Kundendomains gegen die eindeutige Domainzuordnung in der Datenbank prüfen. Nur für die jeweilige Verwendung freigegebene Zuordnungen und Mandanten dürfen Inhalte liefern.
5. Unbekannte, deaktivierte oder noch nicht freigegebene Kundendomains sicher ablehnen; niemals auf einen beliebigen Mandanten zurückfallen.
6. Den aufgelösten Tenant-Kontext an alle nachfolgenden Zugriffe binden. Im Verwaltungsbereich kommen Session, Mitgliedschaft und Aktionsberechtigung hinzu; dessen gemeinsame Domain bestimmt allein keinen Kundenmandanten.

Eine `tenant_id`, Benutzer-ID oder Rolle aus Browser, URL oder Formular darf niemals ungeprüft übernommen werden. Auch Objekt-IDs werden innerhalb des geprüften Mandanten gesucht. Vorschau, Medien, Cache-Schlüssel und Hintergrundjobs müssen dieselben Grenzen beachten. Eine öffentliche Domainzuordnung berechtigt nicht zum Zugriff auf private Kundendaten.

## Gemeinsame Datenbank und Tenant-Isolation

Geplant ist eine gemeinsame MySQL-/MariaDB-Datenbank mit Drizzle ORM und versionierten Migrationen. Datenbankvariante, Version und Betriebsweise sind offen (OD-04). Alle mandantengebundenen Datensätze erhalten eine `tenant_id`; Abfragen und Änderungen werden serverseitig durch Repository-/Service-Grenzen eingeschränkt.

Plattformweite Benutzeridentitäten und Plattformdaten werden bewusst von Mandantendaten unterschieden. Benutzer können über geprüfte Mitgliedschaften mehreren Mandanten angehören. Das interne Akquise-CRM ist Plattformdatenbestand und nicht für Kunden zugänglich. Plattformrechte ersetzen nicht stillschweigend die Prüfung eines Tenant-Zugriffs.

Vorgesehene Grundmodelle sind Mandanten, Benutzer, Mitgliedschaften, Domains, Sites, Tarife/Subscriptions, Feature-Zuordnungen und Audit-Logs. Später folgen Seitenversionen, Blöcke, Navigation, Theme/SEO, fachliche Inhalte, Medien und Anfragen. Konkrete Tabellen, Beziehungen, Indizes, Transaktionen und Migrationsdetails gehören zu Schritt 3 und den Folgeschritten.

Eindeutige Domains und mandantenbezogene Eindeutigkeit etwa für Seitenslugs sind erforderlich. Geldwerte werden exakt gespeichert, Datums- und Zeitzonenregeln noch festgelegt (OD-13). Cross-Tenant-Tests müssen sowohl Lese- als auch Schreibzugriffe und indirekte Zugriffe über Medien, Jobs und Cache abdecken.

## Kontrollierter Block-Builder und Veröffentlichung

Versionierte Blockschemas validieren freigegebene Inhalte und Layoutvarianten. Entwürfe, geschützte Vorschauen und veröffentlichte Versionen sind getrennt. Öffentliche Domains rendern nur gültige veröffentlichte Inhalte; Veröffentlichung und Wiederherstellung werden protokolliert. Autosave und Versionshistorie dürfen einen veröffentlichten Stand nicht unkontrolliert überschreiben.

Eigene Renderer begrenzen die Gestaltung auf sichere Komponenten. Beliebiges Kunden-HTML, JavaScript und globales CSS sind ausgeschlossen. Die Auswahl an Themes, Layouts und Schriftvarianten bleibt offen (OD-10). Cache-Invalidierung und atomare Veröffentlichung müssen vor Umsetzung des CMS konkretisiert werden (OD-07).

## Externe Kundendomains, DNS und SSL

Domains können beim bisherigen Registrar bleiben. Das zunächst teilweise manuelle Onboarding umfasst Zuordnung, zufälliges TXT-Verifikationstoken, Eigentumsprüfung, dokumentierte Routing-Anweisungen, SSL-Prüfung und kontrollierte Aktivierung. Vorgesehene Statuswerte sind pending, verification_required, verified, active, error und disabled. Primärdomain und optionale www-/Apex-Weiterleitung werden separat konfiguriert.

Besitznachweis, DNS-Routing und gültiges TLS-Zertifikat sind unterschiedliche Voraussetzungen. Exakte DNS-Ziele, Zertifikatsabläufe und Statusübergänge hängen vom Hosting ab und sind noch offen (OD-06). Bestehende MX-, SPF-, DKIM- und DMARC-Einträge dürfen nicht ungeprüft verändert werden. In Schritt 1 werden keinerlei Domains, DNS, SSL oder Hostingkonfigurationen verändert.

## SMTP, Scheduler und Hintergrundjobs

Eine zentrale Notification-Schnittstelle soll Einladungen, Passwort-Reset, Anfragebenachrichtigungen und Wiedervorlagen bedienen. SMTP-Zugangsdaten kommen ausschließlich aus der Umgebung. Vorlagen bieten Text und HTML; lokale Tests verwenden einen Mail-Catcher oder sicheren Testmodus.

Ein einzelner Cron-Einstieg verarbeitet geplante Jobs mit begrenzten Retries, Zustellstatus und Idempotenz. Tenant-Kontext, Schutz des Cron-Aufrufs, konkurrierende Ausführung und Fehlerbehandlung sind vor Implementierung zu konkretisieren (OD-08). Idempotenz muss Wiederholungen und Abstürze berücksichtigen; ein Cron-Aufruf allein garantiert keine einmalige Zustellung. Später kann derselbe fachliche Ablauf durch einen dauerhaften VPS-Worker ausgeführt werden.

Passwort-Reset in Schritt 4 und Anfragebenachrichtigungen in Schritt 12 benötigen Grundlagen aus Schritt 14. Die Aufteilung früher Schnittstellen und späterer vollständiger Umsetzung ist noch abzustimmen (OD-09).

## Betrieb, Speicher und VPS-Migration

Der ursprüngliche Plan nannte netcup Webhosting 8000 als erstes Kompatibilitätsziel. Mit dem Auftrag vom 17. September 2026 ist ein Linux-Plesk-System das aktuelle erste Deploymentziel. Ein Next.js-Standalone-Artefakt und Plesk-Einstiegspunkte sind vorbereitet; Node-/Plesk-Version, Proxy-Verhalten, Domain-/SSL-Limits, Cron, Schreibrechte, Uploadspeicher und Ressourcen bleiben bis zur Prüfung am Zielsystem offene Punkte (OD-03, OD-06 und OD-14).

Konfiguration wird aus der Umgebung bezogen. Ein Storage-Adapter kapselt zunächst Dateisystem-/Webhosting-Speicher und später optional S3-kompatiblen Speicher. Fachlogik darf weder WCP-Verzeichnisse noch einen bestimmten Hoster voraussetzen. Beim späteren VPS-Umzug werden Laufzeit, Datenbank, Medien, Cron/Worker und Routing migriert; die Mandanten- und Geschäftslogik bleibt erhalten. Der konkrete Umzugs- und Rollbackplan ist noch nicht festgelegt.

Entwicklung, Staging und Produktion erhalten getrennte Datenbanken, Uploadbereiche, Domains und Konfigurationen. Keine Entwicklung im produktiven Webroot. Deployment und Produktionsaktionen benötigen spätere ausdrückliche Freigabe.

## Datenschutz, Backup und Sicherheit

Eigene Plattform-Rechtstexte und mandantenspezifische Texte bleiben getrennt. Versionierte Consent-Hinweise, widerrufbare Zustimmung und Blockierung optionaler Skripte, Karten und Videos sind vorgesehen. Export, Löschanforderungen, Aufbewahrung und Unterauftragnehmer werden berücksichtigt; konkrete Fristen, Verantwortlichkeiten und Rechtsprüfung bleiben offen (OD-12). Es wird keine automatische Rechtssicherheit oder DSGVO-Zertifizierung behauptet.

Vor Produktivstart sind externe verschlüsselte Backups für Datenbank und Medien sowie ein getesteter Wiederherstellungsprozess erforderlich. Aufbewahrung, Schlüsselverwaltung, Zuständigkeit, Wiederherstellungsziele und Umgang mit gelöschten Daten in Backups müssen noch entschieden werden (OD-14).

Sichere datenbankgestützte Sessions, Passwort-Hashes, begrenzte Einmal-Tokens, serverseitige Autorisierung, Eingabevalidierung, CSRF-/XSS-/Injection-Schutz, Rate-Limiting, Schutz vor offenen Weiterleitungen, sichere Uploads und geeignete Security-Header/CSP sind Anforderungen. Admin-Zwei-Faktor-Authentifizierung wird vorbereitet; der Implementierungszeitpunkt bleibt offen (OD-05).

Supportzugriffe, Rollenänderungen, Veröffentlichungen und Feature-Freigaben werden in Audit-Logs nachvollziehbar erfasst. Technische Logs sind getrennt und redigiert; Fehlerreferenzen dürfen keine sensiblen Daten offenlegen. Health-/Readiness-Prüfungen und ein austauschbarer Monitoring-Adapter werden später ergänzt. Barrierearmut, mobile Nutzung und Unit-, Integrations- sowie E2E-Tests begleiten die Umsetzung, nicht erst die abschließende Härtung.
