# Product Scope

Stand: 17. September 2026. Grundlage sind [Masterprompt](FahrSeiten-Codex-Masterprompt.md), [Laufplan](FahrSeiten-Codex-Laufplan.md) und der Auftrag für Schritt 1. Dieses Dokument beschreibt den geplanten Umfang, keine bereits verfügbaren Funktionen.

## Produkt und Zielgruppe

„FahrSeiten – by ENJO MEDIA“ ermöglicht technisch unerfahrenen Fahrschulinhabern, professionelle Websites zentral zu betreiben und kontrolliert selbst zu pflegen. Jede Fahrschule ist ein Mandant derselben Anwendung. Es gibt keine WordPress-Abhängigkeit, keine Codekopie pro Kunde und keinen freien Pixel-Editor.

## MVP

| Bereich                       | Geplanter Umfang und Grenze                                                                                                                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FahrSeiten-Vertriebsseite     | Startseite, Funktionen, Designs/Demo, zentral konfigurierbare Preise, FAQ, Beratung/Kontakt, Login, Impressum, Datenschutz, Cookie-Einstellungen und Fehler melden; Anfragen gehören ins interne Akquise-CRM                                         |
| Plattform-Admin               | Kunden/Mandanten, Benutzer, Domains, Tarife und Feature-Freigaben, Onboarding, Akquise, interne Notizen, Audit-Übersicht, sichere Supportansicht, Supporttickets, Fehler- und Jobstatus                                                              |
| Akquise                       | Unternehmen, Ansprechpartner, Kontaktwege, Website, Quelle, Aktivitäten, Zuständigkeit, Wiedervorlage und Verlustgrund; Pipeline von neu über kontaktiert, interessiert, Demo und Angebot bis gewonnen oder verloren; Überführung in einen Mandanten |
| Kunden-Backend                | Dashboard, Inhalte, Navigation, Design, Medien, Anfragen, Kontakte, Benutzer/Rollen, Domainstatus, Rechtliches und Einstellungen; verständliche Leer- und Fehlerzustände                                                                             |
| Öffentliche Fahrschulwebsites | Responsive Seiten, Navigation, Logo/Farben/freigegebene Schriften, SEO, kanonische URLs, fachlich korrekte strukturierte Daten, Sitemap und sichere Fehlerseiten                                                                                     |
| Kontrollierter Block-Builder  | Seiten und freigegebene Blöcke bearbeiten, sortieren, duplizieren und ausblenden; Autosave, Vorschau für Desktop/Tablet/Mobil, gültige Entwürfe veröffentlichen, Historie und Wiederherstellung                                                      |
| Fachliche Inhalte             | Führerscheinklassen, Preise mit Preisgruppen und Preispositionen, Kurse und Kurstermine, Team/Fahrlehrer, Fahrzeuge, Standorte, Öffnungszeiten und FAQ; sortierbar und aktivierbar                                                                   |
| Bewertungen                   | Manuell gepflegte Zitate/Bewertungen mit zulässigen Inhalten; keine automatische externe Integration und keine erfundenen Kundenstimmen                                                                                                              |
| Medien                        | Mandantengebundene geprüfte Uploads, Auswahl, Austausch, Archivierung, Alt-Texte und responsive Bildausgabe                                                                                                                                          |
| Kontaktanfragen               | Konfigurierbare Formulare, serverseitige Validierung, Honeypot, Zeitprüfung, Rate-Limiting, versionierter Datenschutzhinweis und Benachrichtigung                                                                                                    |
| Einfache Kontaktverwaltung    | Status neu, in_bearbeitung, beantwortet, abgeschlossen oder spam; Kontakt, Führerscheininteresse, Quelle, Zeitstempel, Notizen, Zuständigkeit, Wiedervorlage und protokollierte Änderungen                                                           |
| Individuelle Domains          | Geprüfte Domainzuordnung, primäre Domain, DNS-/SSL-Status und zunächst teilweise manuelles Onboarding bei externen Registraren                                                                                                                       |
| Impressum und Datenschutz     | Eigene Angaben für FahrSeiten und getrennte Rechtstexte je Mandant; Pflichtangaben und Veröffentlichungswarnungen                                                                                                                                    |
| Technische Consent-Steuerung  | Versionierte Hinweise, Kategorien notwendig/funktional/Statistik/Marketing, optionale Dienste vor Freigabe blockieren, Widerruf und erneute Konfiguration                                                                                            |
| Feature-Flags                 | Zentrale Schlüssel, Tarifzuordnung, Mandanten-Overrides und serverseitige Prüfung; Zustände unavailable, coming_soon, beta und enabled                                                                                                               |

Vorgesehene Blöcke sind Hero, Text mit Bild, Vorteile, Call-to-Action, Führerscheinklassen, Preise, Kurse, Team, Fahrzeuge, Bewertungen, Standorte, Öffnungszeiten, FAQ, Kontaktformular/Kontaktteaser und Galerie. Kunden können kein beliebiges HTML, JavaScript oder globales CSS einfügen.

Kurse und Kurstermine sind redaktionelle Inhalte; sie bedeuten noch keine Fahrstundenplanung oder Terminbuchung. Wiedervorlagen für Anfragen sind von automatischen Fahrstundenerinnerungen getrennt. Tarif- und Subscription-Grundmodelle bedeuten noch keine Zahlungsabwicklung.

## Nicht Bestandteil des ersten MVP

Diese Funktionen sind geplante Erweiterungen und werden in Schritt 1 ausschließlich dokumentiert:

- Fahrstundenplanung und Terminbuchung.
- Schülerverwaltung.
- Automatische Fahrstundenerinnerungen und weitere automatische Terminerinnerungen.
- SMS und WhatsApp.
- Online-Zahlungen, automatische Rechnungsstellung und Abonnementabrechnung.
- Automatische Domainregistrierung und automatisches Domain-Provisioning.
- Vollständig automatisiertes Self-Service-Onboarding.
- Umfangreiche Analytics, erweiterte Statistiken und Conversion-Auswertung.
- Erweitertes CRM und E-Mail-Automationen über die MVP-Benachrichtigungen hinaus.
- Digitale Dokumente, Bewertungs- und Google-Business-Integrationen.
- Externe API und Webhooks als nutzbares Produktangebot.
- Selbst verwaltete Anzeigenkampagnen aus dem Instanzdashboard einschließlich Werbekonten, Budgets, Freigaben und Conversion-Messung.

Die spätere Implementierung benötigt jeweils einen eigenen Auftrag und eine Spezifikation. Es gibt keine zugesagten Veröffentlichungstermine. Geplante Funktionen dürfen nicht durch aktive, funktionslose Bedienelemente als verfügbar erscheinen.

## Früh zu berücksichtigende Grundlagen

In den zuständigen späteren Schritten werden Feature-Schlüssel, Tarife, Ereignisschnittstellen, austauschbarer Speicher, Notification-Schnittstelle, idempotente Jobs mit Retry, Audit-Logs, Export/Löschung, Aufbewahrung sowie Import-/Export- und Abrechnungsgrundmodelle vorbereitet. Daraus folgt keine Freigabe der späteren Fachfunktionen.

## Qualitäts- und Abnahmegrenzen

Mandanten- und Rollenrechte werden serverseitig durchgesetzt und mit Cross-Tenant-Tests geprüft. Eingaben werden validiert; Preise verwenden exakte Dezimalwerte. Responsive Darstellung, Tastaturbedienung, Fokus, Kontraste und verständliche Zustände sind von Anfang an erforderlich. Optionale externe Inhalte bleiben bis zur erforderlichen Zustimmung blockiert.

Demo-, Seed- und Testdaten sind vollständig fiktiv. Secrets und echte Kunden- oder Personendaten gehören nicht ins Repository; technische Logs enthalten keine vollständigen Formulare, Tokens oder Passwörter. Die technischen Datenschutzfunktionen ersetzen keine rechtliche Prüfung.

Schritt 1 ist dokumentarisch abgeschlossen, wenn Produktgrenzen, Architektur, Rollen, Phasen und offene Entscheidungen nachvollziehbar beschrieben und geprüft sind. Ein verkaufbarer oder produktionsreifer MVP ist damit noch nicht erreicht. Ungeklärte Geschäftsentscheidungen stehen in [Offene Entscheidungen](open-decisions.md).
