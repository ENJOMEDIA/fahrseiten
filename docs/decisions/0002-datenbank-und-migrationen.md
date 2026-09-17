# ADR 0002: Datenbank und Migrationen

- Status: angenommen
- Datum: 17. September 2026
- Betrifft: Phase 3, OD-04

## Entscheidung

Das Projekt verwendet den MySQL-Dialekt von Drizzle ORM 0.45 mit `mysql2` 3.24. Das TypeScript-Schema ist die Quelle; `drizzle-kit generate` erzeugt versionierte SQL-Migrationen. Migrationen werden über eine einzelne Verbindung angewendet, während die Anwendung einen begrenzten Pool verwendet. IDs sind von der Anwendung erzeugte UUIDs in `varchar(36)`.

Das Schema bleibt mit zeitgemäßen MySQL- und MariaDB-Versionen kompatibel. Die endgültige Produktivvariante und -version hängen vom Hostingnachweis ab. Es wird kein `drizzle-kit push` für Staging oder Produktion verwendet.

## Gründe und Folgen

Die offizielle Drizzle-Dokumentation empfiehlt `mysql2` und unterstützt code-first Migrationen mit `generate` und `migrate`. UUIDs vermeiden hostabhängige Auto-Increment-Annahmen und sind vor dem Insert verfügbar. Eine gemeinsame Datenbank benötigt konsequente `tenant_id`-Filter in jeder Fachfunktion; Datenbankschema und Indizes unterstützen diese Regel, erzwingen sie aber nicht allein.

Lokale Tests der Tenant-Grenze laufen ohne externe Datenbank. Migration und Seed benötigen eine lokale MySQL-/MariaDB-Instanz. Der reale netcup-Dialekt und die Version werden vor Staging geprüft.

## Rücknahme

Ein Wechsel zwischen kompatiblem MySQL und MariaDB erfolgt nur nach Migrations-, SQL- und Restore-Test. Ein Wechsel zu einem anderen Datenbanksystem benötigt ein neues ADR und eine kontrollierte Datenmigration.
