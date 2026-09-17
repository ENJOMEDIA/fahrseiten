# FahrSeiten – by ENJO MEDIA

FahrSeiten wird eine eigenentwickelte, mandantenfähige SaaS-Plattform für Fahrschulwebsites. Eine zentrale Anwendung und eine gemeinsame Codebasis bedienen mehrere Fahrschulen. WordPress, separate Installationen pro Kunde und ein externer SaaS-Website-Baukasten sind ausgeschlossen.

## Aktueller Stand

Stand: 17. September 2026. Schritt 1 dokumentiert Produktspezifikation und Architekturgrundlage. Das Repository enthält noch keine ausführbare Anwendung, keine installierten Projektabhängigkeiten, Datenbankmigrationen oder Anwendungstests. Alle beschriebenen Produktfunktionen sind geplant. Der autonome Auftrag vom 17. September 2026 erlaubt die anschließende Bearbeitung der Schritte 2 bis 19 ohne einzelne Freigaben.

## Geplante Bereiche

| Bereich                       | Aufgabe                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `fahrseiten.de`               | Vertriebs- und Produktwebsite                                |
| `app.fahrseiten.de`           | Kunden-Backend, Plattformverwaltung und internes Akquise-CRM |
| Individuelle Kundendomains    | Öffentliche Websites der jeweiligen Fahrschulen              |
| `demo.fahrseiten.de`          | Öffentliche Demo mit vollständig fiktiven Inhalten           |
| Optionale Vorschau-Subdomains | Geschützte Entwürfe und Onboarding                           |

## Technischer Zielrahmen

Geplant sind Next.js mit App Router, React, TypeScript Strict Mode, Tailwind CSS, ein eigenes Designsystem sowie MySQL/MariaDB mit Drizzle ORM und versionierten Migrationen. Die Architektur bleibt ein modularer Monolith. Serverseitige Tenant- und Rechteprüfung, SMTP, Cron-basierte Jobs und austauschbarer Speicher gehören zum Fundament.

netcup Webhosting 8000 ist das erste Hostingziel. Seine Eignung für die konkrete Konfiguration ist noch zu prüfen; eine spätere VPS-Migration soll ohne Neuentwicklung der Fachlogik möglich sein.

## Lokales Setup

Voraussetzungen sind Node.js 22 und pnpm 11. Die Entwicklung erfolgt lokal auf dem Mac; Linux und Windows mit WSL sind durch Next.js grundsätzlich unterstützt, aber noch nicht projektspezifisch geprüft.

```bash
corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Danach ist die Anwendung unter `http://localhost:3000` erreichbar. `.env.local` bleibt ignoriert und darf keine produktiven Zugangsdaten enthalten. Die vorhandene `.env.example` dokumentiert ausschließlich sichere Platzhalter.

Die wichtigsten Prüfungen:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
```

`pnpm check` bündelt Formatierung, Linting, Typprüfung, Unit-Tests und Produktions-Build. Datenbank, Mail-Catcher und lokale Testdomains werden in den zuständigen Phasen ergänzt.

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
