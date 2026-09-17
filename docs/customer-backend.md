# Kunden-Backend

Stand: 17. September 2026.

## Zugriff und Navigation

Alle Pfade unter `/kunde` werden in einem gemeinsamen Server-Layout gegen eine aktive Tenant-Mitgliedschaft geprüft. Eine Anmeldung ohne Mitgliedschaft reicht nicht. Mutierende Fachaktionen prüfen zusätzlich die konkrete Berechtigung; ausgeblendete Schaltflächen allein gelten nicht als Schutz.

Die Navigation bündelt Dashboard, Website, strukturierte Inhalte, Medien, Anfragen, Benutzer und Einstellungen. Domainstatus sowie Rechtliches sind aus ihrem fachlichen Kontext erreichbar. Mobil wird dieselbe Navigation über ein semantisches `details`-Menü angeboten.

## Dashboard

Das Dashboard zeigt nur Zustände, die aus dem lokalen Demo-Setup belegbar sind: veröffentlichter Demo-Stand, leerer Anfrageeingang, lokale Testdomain, keine gespeicherten Änderungen und offene rechtliche Pflichtangaben. Es zeigt keine erfundenen Reichweiten, Conversion-Werte oder Kundenkennzahlen. Fahrstundenplanung ist sichtbar als „In Planung“ markiert.

## Arbeitsbereiche

- Website: Seiten, Navigation, Builder, Theme, Domain und Rechtliches.
- Inhalte: Führerscheinklassen, Preise, Kurse, Team, Fahrzeuge, Standorte und Öffnungszeiten mit verständlichen Leerzuständen.
- Medien: Uploadfelder und Bibliothek auf Basis der sicheren Medienfachlogik.
- Anfragen: leerer Posteingang; öffentliche Erfassung und CRM-Status folgen in Schritt 12.
- Benutzer: tenantgebundene Mitgliedschaften und vorbereitete Einladungen nach Rollenmodell.
- Rechtliches und Consent: sichtbare Prüflücken; versionierte Fachlogik folgt in Schritt 17.
- Einstellungen: Anzeigename, Zeitzone und sichere Abmeldung.

Wegen der fehlenden lokalen MySQL-Instanz sind die redaktionellen Listen als klar erkennbare lokale UI-Fixtures umgesetzt. Sie enthalten nur fiktive Daten. Persistente Serveraktionen werden jeweils mit dem Fachmodul verbunden, sobald die Datenbank verfügbar ist; die Benutzeroberfläche darf bis dahin keinen dauerhaften Speichervorgang vortäuschen.

## Manuelle Prüfung

1. Mit dem lokalen Demo-Tenant anmelden und alle Einträge der Seitenleiste sowie Website, Domain und Rechtliches öffnen.
2. Auf schmaler Ansicht das mobile Menü ausschließlich mit Tastatur bedienen.
3. In jedem Inhaltsmodul einen lokalen Eintrag anlegen, deaktivieren und sortieren.
4. Prüfen, dass Anfragen leer bleiben und kommende Funktionen als „In Planung“ oder nächste Phase gekennzeichnet sind.
5. Als Nutzer ohne Tenant-Mitgliedschaft `/kunde` öffnen; die Anmeldung muss erscheinen.
