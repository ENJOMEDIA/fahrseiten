# CMS und Veröffentlichung

Stand: 17. September 2026.

## Modell

Eine Seite gehört über `tenant_id` und `site_id` eindeutig zu einem Mandanten. Ihr Slug ist innerhalb dieses Mandanten eindeutig. Inhalt liegt nicht direkt an der Seite, sondern in unveränderlichen Versionen. Eine veröffentlichte Seite verweist mit `published_version_id` auf genau die öffentlich sichtbare Version. Entwürfe bleiben davon getrennt.

Jeder Block speichert Typ, Position, Sichtbarkeit, Eigenschaften und `schema_version`. Die Anwendung akzeptiert ausschließlich die zentral definierten Typen Hero, Text mit Bild, Vorteile, Call-to-Action, FAQ und Kontaktteaser. Zod validiert alle Eigenschaften. Beliebiges HTML und JavaScript werden weder gespeichert noch gerendert.

## Veröffentlichung und Wiederherstellung

Vor einer Veröffentlichung werden alle Blöcke erneut vollständig validiert. Die neue Version wird veröffentlicht und die vorige Veröffentlichung archiviert. Die Datenbankschreibvorgänge müssen im produktiven Repository atomar in einer Transaktion erfolgen. Eine Wiederherstellung kopiert eine frühere Version in einen neuen Entwurf; veröffentlichte Historie wird nicht nachträglich verändert.

Nach erfolgreichem Commit der Veröffentlichung soll ein Cache-Invalidierungsadapter die betroffene Kombination aus Tenant und Pfad invalidieren. Die konkrete Cachestrategie bleibt bis zum Hostingnachweis austauschbar. Eine Invalidierung darf niemals tenantübergreifend allein anhand eines Slugs erfolgen.

## Vorschau und öffentlicher Zugriff

Die öffentliche Repository-Abfrage verlangt `tenant_id`, Status `published` und die referenzierte veröffentlichte Version. Ein Entwurf ist damit über die öffentliche Domain nicht erreichbar. Eine spätere Vorschau erhält eine eigene authentifizierte Route und prüft Tenant-Mitgliedschaft sowie Bearbeitungsrecht serverseitig.

`/demo` verwendet bei `DEMO_DATA_MODE=fixture` vollständig fiktive, validierte Daten. Der Adapter hält die lokale Demo ohne MySQL lauffähig. Kundendomains verwenden die Datenbankabfrage. Vor einer produktionsnahen Abnahme wird `DEMO_DATA_MODE=database` mit angewendeten Migrationen und Seeds geprüft.

## Manuelle Prüfung

1. `/demo` und die Navigation zu `/demo/ueber-uns` sowie `/demo/kontakt` öffnen.
2. Sichtbaren Demo-Hinweis, Blockreihenfolge und Tastaturbedienung prüfen.
3. Einen unbekannten Pfad wie `/demo/nicht-vorhanden` aufrufen; die 404-Seite muss erscheinen.
4. Mit lokaler MySQL-Instanz Migration und Seed anwenden und eine aktive Testdomain auf den Demo-Tenant auflösen.
