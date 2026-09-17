# FahrSeiten – by ENJO MEDIA

FahrSeiten wird eine eigenentwickelte, mandantenfähige SaaS-Plattform für Fahrschulwebsites. Eine zentrale Anwendung und eine gemeinsame Codebasis bedienen mehrere Fahrschulen. WordPress, separate Installationen pro Kunde und ein externer SaaS-Website-Baukasten sind ausgeschlossen.

## Aktueller Stand

Stand: 17. September 2026. Schritt 1 dokumentiert Produktspezifikation und Architekturgrundlage. Das Repository enthält noch keine ausführbare Anwendung, keine installierten Projektabhängigkeiten, Datenbankmigrationen oder Anwendungstests. Alle beschriebenen Produktfunktionen sind geplant. Der autonome Auftrag vom 17. September 2026 erlaubt die anschließende Bearbeitung der Schritte 2 bis 19 ohne einzelne Freigaben.

## Geplante Bereiche

| Bereich | Aufgabe |
| --- | --- |
| `fahrseiten.de` | Vertriebs- und Produktwebsite |
| `app.fahrseiten.de` | Kunden-Backend, Plattformverwaltung und internes Akquise-CRM |
| Individuelle Kundendomains | Öffentliche Websites der jeweiligen Fahrschulen |
| `demo.fahrseiten.de` | Öffentliche Demo mit vollständig fiktiven Inhalten |
| Optionale Vorschau-Subdomains | Geschützte Entwürfe und Onboarding |

## Technischer Zielrahmen

Geplant sind Next.js mit App Router, React, TypeScript Strict Mode, Tailwind CSS, ein eigenes Designsystem sowie MySQL/MariaDB mit Drizzle ORM und versionierten Migrationen. Die Architektur bleibt ein modularer Monolith. Serverseitige Tenant- und Rechteprüfung, SMTP, Cron-basierte Jobs und austauschbarer Speicher gehören zum Fundament.

netcup Webhosting 8000 ist das erste Hostingziel. Seine Eignung für die konkrete Konfiguration ist noch zu prüfen; eine spätere VPS-Migration soll ohne Neuentwicklung der Fachlogik möglich sein.

## Geplantes lokales Setup

Die Entwicklung erfolgt auf dem Mac. Das spätere Setup soll einen reproduzierbaren Ablauf bieten:

1. Repository lokal auschecken und einen Branch für den beauftragten Laufplanschritt verwenden.
2. Nach dokumentierter Versionsentscheidung Node.js und den noch auszuwählenden Paketmanager einrichten.
3. Projektabhängigkeiten anhand einer versionierten Lockdatei installieren, sobald Schritt 2 diese bereitstellt.
4. Lokale Konfiguration getrennt von Staging und Produktion bereitstellen; keine Zugangsdaten oder echten Kunden- und Personendaten ins Repository aufnehmen.
5. Ab Schritt 3 eine lokale MySQL-/MariaDB-Datenbank mit Migrationen und ausschließlich fiktiven Seed-Daten verwenden.
6. Testdomains für getrennte Marketing-, Verwaltungs- und Tenant-Kontexte sowie einen lokalen Mail-Catcher oder sicheren Testmodus einrichten, sobald die jeweiligen Phasen beauftragt sind.
7. Anwendung starten und die vorgesehenen Skripte `dev`, `build`, `lint`, `typecheck` und `test` nutzen, sobald sie existieren.

Diese Schritte sind ein Zielablauf, noch keine ausführbare Installationsanleitung. Node.js 22 ist als Zielumgebung festgelegt. Weitere Versionen, Datenbankbetrieb und Testwerkzeuge werden in den zuständigen Phasen entschieden. Eine `.env.example` darf ausschließlich dokumentierte Platzhalter enthalten; lokale `.env`-Dateien und Secrets bleiben ausgeschlossen.

## Verbindliche Grundlagen und Dokumentation

- [AGENTS.md](AGENTS.md): dauerhafte Git- und Sicherheitsregeln.
- [Masterprompt](docs/FahrSeiten-Codex-Masterprompt.md): Produkt- und Architekturvorgaben.
- [Laufplan](docs/FahrSeiten-Codex-Laufplan.md): schrittweise Umsetzung und Abnahmekriterien.
- [Product Scope](docs/product-scope.md): MVP und spätere Erweiterungen.
- [Architektur](docs/architecture.md): Systemgrenzen, Mandanten und Betrieb.
- [Rollen und Berechtigungen](docs/roles-and-permissions.md): Rollenrahmen und offene Detailrechte.
- [Roadmap](docs/roadmap.md): Phasen und aktueller Status.
- [Ausführungsstatus](docs/execution-status.md): Zeitpunkte, Commits, Prüfungen und Fortsetzungspunkt.
- [Offene Entscheidungen](docs/open-decisions.md): ungeklärte Punkte und Dokumentationsabweichungen.
- [Architecture Decision Records](docs/decisions/README.md): Verfahren für technische Entscheidungen.

## Arbeitsweise und Prüfung

Für die Schritte 1 bis 19 sind lokale Conventional Commits ausdrücklich beauftragt; es erfolgt kein automatischer Push. Die Übertragung kann später gesammelt über GitHub Desktop mit „Push origin“ erfolgen. Der aktuelle Gesamtauftrag hat gegenüber älteren Freigabe- und Push-Regeln Vorrang.

Nur aufgabenbezogene Dateien stagen. Niemals Force-Push verwenden oder fremde Änderungen verwerfen. Bei Konflikten oder fehlgeschlagenen Prüfungen stoppen und die Ursache melden. DNS-, Hosting- und Produktionsänderungen sind nicht freigegeben.

Aktuell sind Vollständigkeit, Konsistenz, relative Dokumentationslinks, Markdown und Git-Diff zu prüfen. Linting, Typprüfung, Build und Anwendungstests werden erst mit dem technischen Grundgerüst verfügbar.
