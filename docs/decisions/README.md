# Architecture Decision Records

Dieses Verzeichnis enthält die Architecture Decision Records (ADRs) des Projekts.

## Vorhandene ADRs

- [0001 – Runtime und Projektbasis](0001-runtime-und-projektbasis.md)
- [0002 – Datenbank und Migrationen](0002-datenbank-und-migrationen.md)
- [0003 – Authentifizierung und Sitzungen](0003-authentifizierung-und-sitzungen.md)
- [0004 – Domain- und Hostauflösung](0004-domain-und-hostaufloesung.md)
- [0005 – CMS-Versionen und lokale Demo](0005-cms-versionen-und-lokale-demo.md)
- [0006 – Plesk-Bereitstellung aus Git als Standalone-Build](0006-plesk-standalone-deployment.md)

## Zweck und Ablage

Ein ADR beschreibt eine konkrete technische Entscheidung, ihre Gründe und Folgen. Die verbindlichen Produktgrenzen aus [Masterprompt](../FahrSeiten-Codex-Masterprompt.md), [Laufplan](../FahrSeiten-Codex-Laufplan.md) und [Product Scope](../product-scope.md) werden dadurch nicht stillschweigend verändert. Noch ungeklärte Punkte stehen in [Offene Entscheidungen](../open-decisions.md).

Dateien erhalten fortlaufende Nummern und sprechende Namen. Zulässige Statuswerte sind vorgeschlagen, angenommen, verworfen und ersetzt. „Angenommen“ darf erst nach dokumentierter Entscheidung und erforderlicher Prüfung verwendet werden.

## Inhalt eines ADR

1. Titel, Nummer, Datum und Status.
2. Kontext, betroffene Laufplanphase und Verweis auf offene Entscheidungen.
3. Anforderungen und Randbedingungen einschließlich Mandantentrennung, Sicherheit und Hosting.
4. Betrachtete Alternativen mit Vorteilen und Nachteilen.
5. Konkrete Entscheidung mit Versionen, falls relevant, sowie Verantwortlichem und erforderlicher Freigabe.
6. Begründung und aktuelle offizielle Quellen mit Prüfdatum für versions- oder sicherheitskritische Aussagen.
7. Konsequenzen, Risiken, Kostenfolgen und bekannte Einschränkungen.
8. Nachweise, Tests und noch nötige Kompatibilitätsprüfungen.
9. Migrations-/Rücknahmeweg und Verweis auf ersetzte oder nachfolgende ADRs.

## Pflege

Vorgeschlagene Entscheidungen sind keine Implementierungsfreigabe. Fehlende Nachweise werden sichtbar benannt. Bei Ablösung bleibt das bisherige ADR als Historie erhalten und verweist auf den Nachfolger. Geschäftsentscheidungen wie Preise und Tarifumfang benötigen eine ausdrückliche Entscheidung von ENJO MEDIA und dürfen nicht durch eine technische Bibliothekswahl vorweggenommen werden.

Erste geplante Themen sind Laufzeit/Framework und Hostingkompatibilität, Datenbank/Migrationen, Authentifizierung, Host-/Proxy-Vertrauen, Veröffentlichung/Cache, Storage sowie Job- und Notification-Verarbeitung. Reihenfolge und konkrete Auswahl folgen dem jeweils beauftragten Laufplanschritt.
