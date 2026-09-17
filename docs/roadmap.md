# Roadmap und Status

Stand: 17. September 2026. Diese Übersicht bildet den [verbindlichen Laufplan](FahrSeiten-Codex-Laufplan.md) ab, ersetzt aber nicht dessen Anforderungen und Abnahmekriterien. Schritt 0 bezeichnet dort den einleitenden Masterprompt; die Umsetzungsschritte beginnen bei 1.

## Meilensteine

- A – Fundament: Schritte 1 bis 6.
- B – Websiteprodukt: Schritte 7 bis 10.
- C – Verkaufbarer MVP: Schritte 11 bis 17.
- D – Betriebsbereit: Schritte 18 bis 21.

## Phasenstatus

| Schritt | Meilenstein | Inhalt | Status | Abnahmeziel in Kurzform |
| --- | --- | --- | --- | --- |
| 1 | A | Repository prüfen und Produktspezifikation anlegen | Dokumentation erstellt; zur Nutzerprüfung | Produktgrenzen, Architektur, Rollen und offene Entscheidungen dokumentiert; keine Fachfunktionen |
| 2 | A | Technisches Grundgerüst | Nicht begonnen | Reproduzierbare Installation, Start, Build und Grundprüfungen |
| 3 | A | Datenbank und Mandantenfundament | Nicht begonnen | Migration/Seed und Cross-Tenant-Isolation geprüft |
| 4 | A | Authentifizierung und Rechte | Nicht begonnen | Sessions und Rollen gegen Manipulation geprüft |
| 5 | A | Domain- und Tenant-Auflösung | Nicht begonnen | Testhosts laden ausschließlich den richtigen Mandanten |
| 6 | A | Designsystem und Anwendungslayouts | Nicht begonnen | Gemeinsame barrierearme und mobile Grundlagen |
| 7 | B | Seiten-, Block- und Veröffentlichungssystem | Nicht begonnen | Datengetriebene Demo, geschützte Entwürfe und Veröffentlichung |
| 8 | B | Fahrschulspezifische Inhaltsmodule | Nicht begonnen | MVP-Inhalte validiert und mandantengebunden darstellbar |
| 9 | B | Medienverwaltung | Nicht begonnen | Geprüfte Uploads und isolierter Medienzugriff |
| 10 | B | Intuitiver Block-Builder | Nicht begonnen | Bearbeiten, Vorschau, Veröffentlichung und Wiederherstellung geprüft |
| 11 | C | Kunden-Backend vollständig machen | Nicht begonnen | Kundenabläufe; Abnahmeabhängigkeiten OD-09 zuerst klären |
| 12 | C | Kontaktformulare, Leads und einfaches Kunden-CRM | Nicht begonnen | Anfrage beim richtigen Mandanten mit Benachrichtigung; OD-09 |
| 13 | C | Plattform-Admin und Akquise-CRM | Nicht begonnen | Akquise, Kundenanlage und Onboarding mit Rollenprüfung |
| 14 | C | E-Mail, Benachrichtigungen und Hintergrundjobs | Nicht begonnen | Idempotenz, Retry und sicherer Testbetrieb nachgewiesen |
| 15 | C | Tarife, Feature-Flags und kommende Funktionen | Nicht begonnen | Serverseitige Freigaben nach Tarif und Mandant |
| 16 | C | FahrSeiten-Vertriebswebsite | Nicht begonnen | Navigierbar, ehrlich formuliert und an Akquise angebunden |
| 17 | C | Datenschutz-, Consent- und Rechtsgrundlagen technisch umsetzen | Nicht begonnen | Optionale Dienste blockiert, getrennte Mandantentexte pflegbar |
| 18 | D | Fehlerberichte, Monitoring und Support | Nicht begonnen | Nachvollziehbare Fehler ohne sensible Logdaten |
| 19 | D | Sicherheit, Qualität und Barrierefreiheit härten | Nicht begonnen | Release-Readiness ohne kritische offene Punkte |
| 20 | D | Netcup-Staging vorbereiten | Nicht begonnen | Dokumentierter und freigegebener Ablauf nur mit Testdaten |
| 21 | D | Pilotkunde und Produktivstart | Nicht begonnen | Kontrollierter Pilot mit ausdrücklicher Produktionsfreigabe |

## Aktueller Lieferumfang und nächster Schritt

Schritt 1 liefert README, Product Scope, Architekturgrundlage, Rollenrahmen, diese Roadmap, offene Entscheidungen und das ADR-Verfahren. Es gibt keine Produktfunktionen, Next.js-Einrichtung oder Betriebsänderung. Die Nutzerabnahme wird nicht vorweggenommen.

Nach Prüfung dieser Dokumentation ist Schritt 2 der nächste mögliche Auftrag. Er wird nicht automatisch begonnen. Vor der Anlage einer Umgebungsbeispieldatei ist OD-02 zu klären; konkrete Versionsentscheidungen benötigen aktuelle Kompatibilitätsnachweise und ADRs.

## Abhängigkeiten und Fortschreibung

Die ursprüngliche Reihenfolge bleibt erhalten. OD-09 in [Offene Entscheidungen](open-decisions.md) erfasst die Notification-Abhängigkeiten aus Schritt 4/12 zu Schritt 14 sowie die zu weit vorgreifende Backend-Abnahme in Schritt 11. Vor den betroffenen Schritten sind Schnittstellen und Zwischenabnahmen abzustimmen. Spätere Features dürfen nicht stillschweigend vorgezogen werden.

Statuswerte werden anhand des tatsächlichen Standes gepflegt: Nicht begonnen, In Arbeit, Blockiert, Zur Nutzerprüfung oder Abgenommen. Eine erledigte Dokumentation bedeutet weder eine funktionierende Anwendung noch eine Produktionsfreigabe. Nach jedem beauftragten Schritt werden Prüfungen, offene Risiken und manuelle Prüfanleitung berichtet; der nächste Schritt benötigt einen neuen Auftrag.

## Spätere Erweiterungen

Die im [Product Scope](product-scope.md) ausgeschlossenen Funktionen folgen erst nach erfolgreichem Pilotbetrieb und eigener Spezifikation mit Datenmodell, Rechten, Tests und kontrollierter Freigabe. Es werden keine Termine oder Prioritäten zugesagt.

## Manuelle Prüfung von Schritt 1

1. README lesen und prüfen, dass Ziel-Setup und tatsächlicher Stand klar getrennt sind.
2. MVP und Nicht-MVP im Product Scope mit dem Auftrag vergleichen.
3. Tenant-Auflösung, Datenzugriff, Hostinggrenzen und Sicherheitsgrundlagen in der Architektur prüfen.
4. Rollenrahmen und ausdrücklich offene Aktionsrechte prüfen.
5. Offene Entscheidungen einschließlich Dokumentationsabweichungen durchgehen; es ist keine pauschale Freigabe aller Vorschläge erforderlich.
6. Git-Diff kontrollieren: ausschließlich die sieben beauftragten Markdown-Dateien, keine Anwendung oder Konfiguration.
7. Nach dem lokalen Commit bei Bedarf in GitHub Desktop „Push origin“ ausführen. Kein automatischer Push oder Merge durch Codex.
