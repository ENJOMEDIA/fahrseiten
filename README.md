# FahrSeiten – by ENJO MEDIA

FahrSeiten wird eine eigenentwickelte, mandantenfähige SaaS-Plattform für Fahrschulwebsites. Eine zentrale Anwendung und eine gemeinsame Codebasis bedienen mehrere Fahrschulen. WordPress, separate Installationen pro Kunde und ein externer SaaS-Website-Baukasten sind ausgeschlossen.

## Aktueller Stand

Stand: 17. September 2026. Die Schritte 1 bis 19 des Laufplans sind lokal umgesetzt. Das Repository enthält die ausführbare Next.js-Anwendung, versionierte Drizzle-Migrationen, einen idempotenten Demo-Seed, lokale Fixture-Adapter, Unit-/Integrations- und Chromium-E2E-Tests sowie den [Release-Readiness-Bericht](docs/release-readiness.md). Schritte 20 und 21, reales Staging, DNS/SSL, Deployment und Pilotbetrieb wurden nicht begonnen.

## Geplante Bereiche

| Bereich                       | Aufgabe                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `fahrseiten.de`               | Vertriebs- und Produktwebsite                                |
| `app.fahrseiten.de`           | Kunden-Backend, Plattformverwaltung und internes Akquise-CRM |
| Individuelle Kundendomains    | Öffentliche Websites der jeweiligen Fahrschulen              |
| `demo.fahrseiten.de`          | Öffentliche Demo mit vollständig fiktiven Inhalten           |
| Optionale Vorschau-Subdomains | Geschützte Entwürfe und Onboarding                           |

## Technischer Zielrahmen

Eingesetzt werden Next.js mit App Router, React, TypeScript Strict Mode, Tailwind CSS, ein eigenes Designsystem sowie MySQL/MariaDB mit Drizzle ORM und versionierten Migrationen. Die Architektur ist ein modularer Monolith. Serverseitige Tenant- und Rechteprüfung, SMTP- und Cron-Adapter, kontrollierter Block-Builder, Consent-Steuerung und austauschbarer Speicher gehören zum Fundament.

Ein Linux-Plesk-System ist das aktuelle erste Deploymentziel. Seine konkrete Node.js-, Proxy-, Datenbank- und Speicherumgebung muss noch am Zielsystem geprüft werden; eine spätere VPS-Migration soll ohne Neuentwicklung der Fachlogik möglich sein.

Für ein Plesk-System kann mit `pnpm build:plesk` ein geprüftes Next.js-Standalone-Artefakt erstellt werden. Konfiguration, Migration, Healthcheck und Rollback beschreibt die [Plesk-Deployment-Anleitung](docs/deployment-plesk.md). Die Anleitung nimmt selbst keine Hosting-, DNS- oder SSL-Änderungen vor.

## Lokales Setup

Voraussetzungen sind Node.js 22 und pnpm 11. Die Entwicklung erfolgt lokal auf dem Mac; Linux und Windows mit WSL sind durch Next.js grundsätzlich unterstützt, aber noch nicht projektspezifisch geprüft.

```bash
corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Danach ist die Anwendung unter `http://localhost:3000` erreichbar. Mit dem voreingestellten `DEMO_DATA_MODE=fixture` funktionieren Vertriebsseite, öffentliche Demo, Builder-Demo, Formulare und Consent lokal ohne MySQL. `.env.local` bleibt ignoriert und darf keine produktiven Zugangsdaten enthalten. Die vorhandene `.env.example` dokumentiert ausschließlich sichere Platzhalter.

Für die datenbankgestützten Admin- und Kundenbereiche ist eine lokale MySQL-/MariaDB-Instanz erforderlich. Nach Anpassung der ausschließlich lokalen `DATABASE_URL`:

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Der Seed legt ausschließlich fiktive lokale Konten an: `plattform@fahrseiten.local` und `inhaber@morgenrot.local`, jeweils mit `Demo-FahrSeiten-2026!`. Diese Zugangsdaten dürfen nie in einer öffentlich erreichbaren Umgebung eingesetzt werden.

Die wichtigsten Prüfungen:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm exec playwright install chromium
pnpm test:e2e
pnpm db:check
pnpm audit --prod
pnpm build
```

`pnpm check` bündelt Formatierung, Linting, Typprüfung, Unit-Tests und Produktions-Build. Die lokale Demo ist außerdem direkt unter `http://localhost:3000/demo` und der kontrollierte Builder unter `http://localhost:3000/builder-demo` erreichbar. Für Host-Auflösungstests können `demo.localhost` und `app.localhost` verwendet werden, sofern das lokale System diese Namen auf `127.0.0.1` auflöst.

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

Vor jedem weiteren Meilenstein sind mindestens Formatierung, Linting, Typprüfung, Unit-/Integrationstests, E2E-Tests, Drizzle-Schema und Produktions-Build zu prüfen. Produktive Migrationen, Hosting-, DNS- oder SSL-Aktionen benötigen einen späteren ausdrücklich freigegebenen Auftrag.
