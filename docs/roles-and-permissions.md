# Rollen und Berechtigungen

Stand: 17. September 2026. Geplanter Rollenrahmen aus dem [Masterprompt](FahrSeiten-Codex-Masterprompt.md); noch keine implementierte Autorisierung. Nicht festgelegte Detailrechte sind ausdrücklich offen (OD-11 in [Offene Entscheidungen](open-decisions.md)).

## Rollenrahmen

| Rolle              | Geltungsbereich      | Vorgesehene Befugnisse                                                                                       | Verbindliche Grenzen                                                                                                                  |
| ------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `platform_owner`   | Plattform            | Vollständige Plattformverwaltung einschließlich Mandanten, Rollen, Tarifen, Features und Systemeinstellungen | Serverseitige Prüfung und Audit auch bei privilegierten Aktionen; keine unprotokollierte Kontoübernahme                               |
| `platform_sales`   | Plattform            | Akquise, Leads, Angebote und Onboarding                                                                      | Keine sicherheitskritischen Systemeinstellungen; Detailrechte für Kundenanlage, Einladungen und Tarifänderungen noch offen            |
| `platform_support` | Plattform            | Support und Diagnose                                                                                         | Keine ungeprüften Tarif-, Eigentümer- oder Sicherheitsänderungen; Umfang und Freigabe von Kundendatenzugriffen noch offen             |
| `tenant_owner`     | Eigener Mandant      | Inhaber/Hauptadministrator; Verwaltung des eigenen Mandanten im freigeschalteten Produktumfang               | Keine Plattformrechte und keine Rechte an fremden Mandanten; Eigentumsübertragung und destruktive Aktionen noch zu spezifizieren      |
| `tenant_editor`    | Zugewiesener Mandant | Inhalte und definierte Geschäftsdaten bearbeiten                                                             | Keine impliziten Verwaltungsrechte; Veröffentlichung, Rechtstexte, Anfragen, Export und Benutzerverwaltung noch im Detail festzulegen |
| `tenant_viewer`    | Zugewiesener Mandant | Ausschließlich lesender Zugriff auf ausdrücklich freigegebene Bereiche                                       | Keine Änderungen; Einsicht in personenbezogene Anfragen, Export und weitere Lesebereiche nicht pauschal freigegeben                   |

## Durchsetzung

Ein Benutzer kann mehreren Mandanten angehören. Jede Mitgliedschaft besitzt einen eigenen geprüften Rollenbezug. Plattformrollen und Mandantenrollen werden strikt getrennt; eine Mandantenrolle gewährt keinen Zugriff auf Plattform-Akquise oder andere Mandanten.

Bei jeder geschützten Aktion sind Session, aktive Mitgliedschaft beziehungsweise ausdrücklich erlaubter Plattformzugriff, Zielmandant, Objektzugehörigkeit, Aktion und gegebenenfalls Feature-Berechtigung serverseitig zu prüfen. Eine vom Browser ausgewählte `tenant_id` ist nur eine Anfrage, kein Nachweis. Versteckte Navigation ist kein Zugriffsschutz.

Nicht festgelegte Rechte gelten nicht als erteilt. Öffentliche Besucher dürfen freigegebene veröffentlichte Inhalte lesen und vorgesehene öffentliche Formulare absenden; dies erteilt keinen Backend-Zugriff. Auch Vorschauen benötigen eine eigene geprüfte Berechtigung.

## Noch zu konkretisierende Aktionsmatrix

Vor der jeweiligen Implementierung sind insbesondere diese Aktionen pro Rolle festzulegen:

- Veröffentlichung, Wiederherstellung, Rechtstext- und Consent-Änderungen.
- Zugriff auf Anfragen und personenbezogene Kontakte, Export und Löschung.
- Einladungen, Rollenwechsel, Eigentumsübertragung und letzte verbleibende Inhaberrolle.
- Domainzuordnung, Verifikation, Aktivierung und Weiterleitungen.
- Tarifänderungen, Feature-Overrides und Freigabe sicherheitskritischer Änderungen.
- Supportzugriff: Zweck, Umfang, Dauer, Freigabe und Protokollierung.

Diese Liste ist ein Entscheidungsbedarf, keine zusätzliche Rechtevergabe. Die Freigabe geschäftlicher Rechte liegt bei ENJO MEDIA. Die konkrete Sicherheitsumsetzung wird als ADR festgehalten.

## Audit und geplante Prüfungen

Sicherheitsrelevante Aktionen, Rollenwechsel, Supportzugriffe, Veröffentlichungen und Feature-Freigaben benötigen nachvollziehbare Audit-Einträge ohne Secrets. Aufbewahrung und Einsicht in diese Protokolle bleiben festzulegen.

Ab Schritt 4 werden erlaubte und verbotene Aktionen, Mehrfachmitgliedschaften, manipulierte Rollen-/Tenant-/Objekt-IDs sowie entzogene oder deaktivierte Zugriffe getestet. Cross-Tenant-Isolation ist auch bei privilegierten Plattformabläufen explizit zu prüfen. Es existieren in Schritt 1 noch keine ausführbaren Rechteprüfungen oder Tests.
