# FahrSeiten – Codex-Laufplan

Stand: 16. September 2026  
Marke: **FahrSeiten – by ENJO MEDIA**

Dieses Dokument ist ein schrittweiser Bauplan für die Entwicklung von FahrSeiten mit Codex. Die Aufträge werden nacheinander in **demselben Codex-Thread** gesendet. Erst wenn ein Schritt vollständig abgeschlossen, getestet und von dir geprüft wurde, folgt der nächste.

Wenn ein neuer Codex-Thread begonnen wird, zuerst erneut den Master-Prompt und danach den aktuellen Schritt senden.

---

## Geplantes Produkt

FahrSeiten ist eine vollständig eigenentwickelte, mandantenfähige Plattform für Fahrschulwebsites. Es gibt keine WordPress-Installationen und keine eigene Softwarekopie pro Kunde.

Die Plattform besteht aus:

1. `fahrseiten.de`: Vertriebs- und Produktwebsite
2. `app.fahrseiten.de`: Kunden- und Plattformverwaltung
3. individuellen Kundendomains: öffentliche Websites der Fahrschulen

Eine zentrale Anwendung erkennt anhand der aufgerufenen Domain, welcher Mandant geladen werden muss.

### Geplanter technischer Rahmen

- Next.js mit App Router
- React und TypeScript im Strict Mode
- MySQL/MariaDB
- Drizzle ORM und versionierte Migrationen
- Tailwind CSS und eigenes Designsystem
- serverseitige Mandanten- und Rechteprüfung
- Block-Builder statt freier Pixel-Editor
- SMTP für E-Mails
- Cron/Scheduler für Hintergrundaufgaben
- zunächst netcup Webhosting 8000, später ohne Neuentwicklung auf VPS migrierbar

Bibliotheken dürfen verwendet werden. Produkt, Datenmodell, Builder, Oberfläche und Geschäftslogik bleiben eigenentwickelt und dürfen nicht von WordPress oder einem externen Website-Baukasten abhängen.

---

# 0. Master-Prompt – einmal zu Beginn senden

```text
Wir entwickeln gemeinsam „FahrSeiten – by ENJO MEDIA“: eine vollständig eigenentwickelte, mandantenfähige SaaS-Plattform für Fahrschulwebsites.

Es gibt keine WordPress-Installationen und keine getrennte Codekopie pro Kunde. Eine zentrale Next.js-Anwendung soll die öffentliche Vertriebsseite, den Plattform-Admin, die Kunden-Backends und die öffentlichen Fahrschulwebsites ausliefern. Die aufgerufene Domain bestimmt den Mandanten.

Technischer Zielrahmen:
- Next.js mit App Router, React und TypeScript Strict Mode
- MySQL/MariaDB mit Drizzle ORM und versionierten Migrationen
- Tailwind CSS und ein eigenes, wiederverwendbares Designsystem
- eine gemeinsame Datenbank mit konsequenter tenant_id-Trennung
- serverseitige Authentifizierung und rollenbasierte Rechte
- Block-Builder mit kontrollierten Komponenten statt freier Pixelpositionierung
- SMTP, Scheduler/Cron und später erweiterbare Hintergrundjobs
- lokaler Entwicklungsbetrieb und Staging; Produktivdeployment erst in einem späteren Auftrag
- zunächst kompatibel mit netcup Webhosting 8000, aber infrastrukturell auf einen VPS migrierbar

Arbeitsregeln für jeden Auftrag:
1. Untersuche zuerst den aktuellen Repository-Stand, vorhandene Dokumentation und bestehende Änderungen.
2. Bewahre alle nicht zum Auftrag gehörenden Änderungen. Keine destruktiven Git-Befehle.
3. Arbeite ausschließlich am jeweils beauftragten Schritt und greife nicht ungefragt späteren Phasen vor.
4. Entscheide nicht stillschweigend über sicherheits-, datenschutz- oder geschäftskritische Punkte. Dokumentiere Annahmen oder frage nur bei einem echten Blocker nach.
5. Keine Secrets, echten Kundendaten oder produktiven Zugangsdaten im Repository.
6. Jede mandantengebundene Datenabfrage muss serverseitig an einen geprüften Tenant-Kontext gebunden sein. Eine tenant_id aus dem Browser darf niemals allein vertraut werden.
7. Implementiere verständlich, modular und ohne unnötige Abstraktionen. Vermeide einen verteilten Microservice-Aufbau; zunächst bleibt es eine modulare Anwendung.
8. Ergänze sinnvolle Tests für neue Geschäftslogik. Führe Linting, Typprüfung und relevante Tests aus.
9. Halte Architekturentscheidungen, Setup und bekannte Einschränkungen in /docs aktuell.
10. Nimm keine Veröffentlichung, DNS-Änderung, Produktionseinrichtung oder externe Datenübertragung vor, solange dies nicht ausdrücklich beauftragt wird.

Beende jeden Schritt mit:
- Ergebnis
- geänderten Dateien
- ausgeführten Prüfungen und deren Ergebnis
- offenen Risiken oder Annahmen
- genauer manueller Prüfanleitung
- Empfehlung für den nächsten Laufplanschritt

Führe den nächsten Schritt noch nicht aus, sondern warte auf meinen Auftrag.
```

---

# 1. Repository prüfen und Produktspezifikation anlegen

```text
Schritt 1: Prüfe den aktuellen Repository- und Projektstand. Implementiere noch keine Produktfunktionen.

Erstelle beziehungsweise aktualisiere folgende Dokumente:
- README.md mit Produktüberblick und lokalem Ziel-Setup
- docs/product-scope.md mit MVP, Nicht-MVP und späteren Funktionen
- docs/architecture.md mit der geplanten modularen Gesamtarchitektur
- docs/roles-and-permissions.md mit allen Rollen und Berechtigungen
- docs/roadmap.md mit den Laufplanphasen und Statusfeldern
- docs/decisions/ für Architecture Decision Records

Das MVP umfasst:
- FahrSeiten-Vertriebsseite
- Plattform-Admin für Kunden, Domains und Akquise
- Kunden-Backend
- öffentliche Fahrschulwebsites
- eigener Block-Builder
- Führerscheinklassen, Preise, Kurse, Team, Fahrzeuge, Standorte und FAQ
- Kontaktanfragen und einfache Kontaktverwaltung
- individuelle Domains
- Impressum, Datenschutz und technische Consent-Steuerung
- Feature-Flags für spätere Funktionen

Nicht Teil des ersten MVP:
- Fahrstundenplanung
- Schülerverwaltung
- SMS und WhatsApp
- Online-Zahlungen
- automatische Domainregistrierung
- vollständig automatisiertes Self-Service-Onboarding

Erstelle zusätzlich eine Liste aller noch offenen Produktentscheidungen, aber triff keine willkürlichen Entscheidungen mit geschäftlicher Auswirkung. Stoppe danach und fasse die Planung zusammen.
```

**Abnahme:** Die Produktgrenzen und Rollen sind verständlich dokumentiert. Es wurde noch keine Fachfunktion gebaut.

---

# 2. Technisches Grundgerüst

```text
Schritt 2: Richte auf Grundlage der freigegebenen Dokumentation das technische Grundgerüst ein.

Aufgaben:
- Next.js-App-Router-Projekt mit TypeScript Strict Mode prüfen oder sauber einrichten
- einheitliche Projektstruktur für Marketing, Plattform-Admin, Kunden-Admin und Tenant-Websites
- Tailwind CSS und globale Design-Tokens vorbereiten
- Linting, Formatierung, Typprüfung und Testgrundlage einrichten
- Umgebungsvariablen typisiert validieren
- .env.example ohne echte Secrets anlegen
- lokale Fehlerseiten und Health-Endpunkt vorbereiten
- Basisskripte für dev, build, lint, typecheck und test bereitstellen
- CI-Prüfung für Build, Linting, Typen und Tests vorbereiten

Noch keine Anmeldung, Datenbank-Fachmodelle oder fertigen Oberflächen bauen. Dokumentiere die lokale Einrichtung und führe alle Grundprüfungen aus.
```

**Abnahme:** Frischer Checkout lässt sich nach Anleitung installieren, starten, prüfen und bauen.

---

# 3. Datenbank und Mandantenfundament

```text
Schritt 3: Implementiere das Datenbank- und Mandantenfundament mit Drizzle und MySQL/MariaDB.

Benötigte Grundmodelle:
- tenants
- users
- tenant_memberships
- domains
- sites
- subscriptions oder plans als vorbereitete Grundstruktur
- feature_flags beziehungsweise tenant_features
- audit_logs

Anforderungen:
- stabile UUIDs oder vergleichbar sichere IDs
- created_at, updated_at und sinnvolle Statusfelder
- tenant_id in allen mandantengebundenen Tabellen
- geeignete eindeutige Indizes, insbesondere für Domains
- deaktivierbare statt vorschnell endgültig löschbare Mandanten
- versionierte Drizzle-Migrationen
- Seed-Daten für lokalen Plattform-Admin, Demo-Mandant und Demo-Domain
- zentraler serverseitiger Tenant-Kontext
- Repository-/Service-Schicht, die tenantgebundene Zugriffe erzwingt
- Tests, die einen mandantenübergreifenden Datenzugriff verhindern

Lege ein ER-Diagramm oder eine verständliche Schemaübersicht unter /docs an. Noch keine Benutzeroberflächen bauen.
```

**Abnahme:** Migration und Seed funktionieren reproduzierbar; Cross-Tenant-Tests schlagen bei unzulässigem Zugriff zuverlässig fehl.

---

# 4. Authentifizierung und Rechte

```text
Schritt 4: Implementiere sichere Authentifizierung und rollenbasierte Autorisierung.

Rollen:
- platform_owner
- platform_sales
- platform_support
- tenant_owner
- tenant_editor
- tenant_viewer

Anforderungen:
- sichere, datenbankgestützte Sessions
- Login und Logout
- Passwort-Reset mit zeitlich begrenztem Einmal-Token
- sichere Passwortspeicherung
- Rate-Limiting beziehungsweise vorbereitete Schutzschicht für Login und Reset
- serverseitige Rollenprüfung für jede geschützte Aktion
- Benutzer kann mehreren Mandanten angehören
- aktive Mandantenauswahl nur aus geprüften Mitgliedschaften
- Plattformrollen und Mandantenrollen strikt trennen
- Audit-Einträge für sicherheitsrelevante Aktionen
- Tests für erlaubte und verbotene Rollenwechsel und Zugriffe

Prüfe vor der Bibliothekswahl die aktuelle Kompatibilität mit dem vorhandenen Next.js-Stand und dokumentiere die Entscheidung als ADR. Noch kein vollständiges Dashboard gestalten.
```

**Abnahme:** Rollen lassen sich nicht durch URL-, Formular- oder tenant_id-Manipulation umgehen.

---

# 5. Domain- und Tenant-Auflösung

```text
Schritt 5: Implementiere die Domain- und Mandantenauflösung unabhängig vom späteren Hoster.

Anforderungen:
- Hostnamen normalisieren: Kleinschreibung, Port entfernen, IDN/Punycode berücksichtigen
- fahrseiten.de als Marketing-Kontext
- app.fahrseiten.de als Verwaltungs-Kontext
- lokale Testdomains beziehungsweise localhost-Mapping
- Subdomain-Vorschauen wie demo.fahrseiten.de vorbereiten
- individuelle Kundendomains aus der domains-Tabelle auflösen
- Status: pending, verification_required, verified, active, error, disabled
- primäre Domain und Weiterleitungsziel je Mandant
- zufälliges TXT-Verifikationstoken vorbereiten
- unbekannte oder deaktivierte Domain mit sicherer Fehlerseite behandeln
- keine automatische DNS- oder Produktivänderung durchführen
- ursprünglichen Hostnamen testbar abstrahieren, damit Reverse-Proxy-Verhalten später geprüft werden kann
- Unit- und Integrationstests für Domainauflösung und Tenant-Isolation

Dokumentiere den späteren manuellen DNS- und SSL-Onboardingprozess, ohne ihn jetzt produktiv auszuführen.
```

**Abnahme:** Verschiedene Test-Hostnamen laden zuverlässig verschiedene Demo-Mandanten aus derselben Anwendung.

---

# 6. Designsystem und Anwendungslayouts

```text
Schritt 6: Erstelle das visuelle Grundsystem für FahrSeiten.

Designrichtung:
- hochwertig, modern und ruhig
- klarer ENJO-MEDIA-Qualitätsanspruch
- keine generische Bootstrap-Optik
- mobil zuerst
- gute Kontraste, Tastaturbedienung und sichtbare Fokuszustände
- zentrale Design-Tokens für Farben, Typografie, Abstände, Radien, Schatten und Animationen

Benötigte Layouts:
- Marketing
- Plattform-Admin
- Kunden-Admin
- öffentliche Kundenwebsite
- Authentifizierung

Benötigte Basiskomponenten:
- Buttons, Inputs, Selects, Checkboxen und Dialoge
- Tabellen, Karten, Status-Badges und leere Zustände
- Navigation, Sidebar, Breadcrumbs und mobile Navigation
- Toasts und verständliche Fehlermeldungen
- Skeletons und Ladezustände

Erstelle eine interne Komponentenübersicht. Verwende nur Demo-Inhalte und implementiere noch keine vollständigen Fachseiten.
```

**Abnahme:** Alle vier Bereiche wirken zusammengehörig und funktionieren auf Mobilgerät und Desktop.

---

# 7. Seiten-, Block- und Veröffentlichungssystem

```text
Schritt 7: Implementiere das CMS-Fundament für die Kundenwebsites, zunächst ohne visuellen Builder.

Benötigte Modelle:
- site_pages
- page_versions oder revisions
- page_blocks
- navigation_items
- theme_settings
- seo_settings

Anforderungen:
- Seitenstatus draft und published
- getrennte Entwurfs- und Veröffentlichungsstände
- versioniertes Blockschema mit schema_version
- Reihenfolge, Sichtbarkeit und Blocktyp
- validierte block-spezifische Eigenschaften
- Seitenslug pro Mandant eindeutig
- Vorschau darf Entwürfe anzeigen, öffentliche Domain nur veröffentlichte Inhalte
- Wiederherstellung einer früheren Version vorbereiten
- sichere serverseitige Darstellung ohne beliebiges Nutzer-HTML oder ausführbares JavaScript
- Cache-Invalidierung nach Veröffentlichung vorbereiten

Erstelle zunächst Blockdefinitionen und Renderer für:
- Hero
- Text mit Bild
- Vorteile
- Call-to-Action
- FAQ
- Kontaktteaser

Lege einen vollständigen Demo-Seitenbaum über Seed-Daten an und teste Rendering, Entwurf und Veröffentlichung.
```

**Abnahme:** Eine öffentliche Demo-Website wird vollständig aus Datenbankinhalten und geprüften Blocktypen gerendert.

---

# 8. Fahrschulspezifische Inhaltsmodule

```text
Schritt 8: Ergänze die fachlichen Inhaltsmodelle und öffentlichen Blöcke.

Benötigte Module:
- Führerscheinklassen
- Preisgruppen und Preispositionen
- Kurse und Termine
- Fahrlehrer und Team
- Fahrzeuge und Fuhrpark
- Standorte
- Öffnungszeiten
- Bewertungen als manuell gepflegte Inhalte

Anforderungen:
- jedes Modell ist mandantengebunden
- sortierbar sowie aktivierbar/deaktivierbar
- sinnvolle Validierung und leere Zustände
- Preise als exakte Dezimalwerte, nicht als Fließkommazahlen
- Zeitzonen und Datumswerte sauber behandeln
- öffentliche Blocktypen für jedes Modul
- strukturierte Metadaten dort vorbereiten, wo sie fachlich sinnvoll sind
- Demo-Inhalte für eine fiktive Fahrschule
- Tests für Mandantentrennung und Validierung

Noch keine komplexe Terminbuchung, Schülerverwaltung oder automatische Bewertungsintegration implementieren.
```

**Abnahme:** Alle MVP-Inhalte können datengetrieben auf der Demo-Website dargestellt werden.

---

# 9. Medienverwaltung

```text
Schritt 9: Implementiere eine sichere, austauschbare Medienverwaltung.

Anforderungen:
- Medienobjekte immer einem Mandanten zuordnen
- Bilder hochladen, auswählen, ersetzen und archivieren
- Dateityp und Dateigröße serverseitig prüfen
- sichere Dateinamen und keine Ausführung hochgeladener Inhalte
- Alt-Texte und optionale Bildbeschreibungen
- Bilddimensionen und Metadaten speichern
- responsive Bildausgabe und Optimierung
- Storage-Adapter: zunächst lokaler beziehungsweise Webhosting-Speicher, später S3-kompatibel ohne Änderung der Fachlogik
- keine endgültige Löschung verwendeter Bilder ohne Warnung
- Speicherpfade dürfen keine vertraulichen Informationen enthalten
- Tests für unzulässige Uploads und Cross-Tenant-Zugriffe

Integriere die Medienauswahl anschließend in die bereits vorhandenen Bildblöcke.
```

**Abnahme:** Ein Mandant kann ausschließlich seine eigenen geprüften Bilder sehen und verwenden.

---

# 10. Intuitiver Block-Builder

```text
Schritt 10: Baue den visuellen Block-Builder auf dem bestehenden CMS-Fundament.

Funktionen:
- Seite auswählen und anlegen
- Blöcke hinzufügen, duplizieren, sortieren und ausblenden
- blockabhängige Formularfelder
- direkte Desktop-, Tablet- und Mobilvorschau
- automatische Entwurfsspeicherung mit erkennbarem Speicherstatus
- ungespeicherte Änderungen absichern
- Validierungsfehler direkt am betroffenen Block
- Veröffentlichung nur bei gültigem Inhalt
- Versionshistorie und Wiederherstellung
- Navigation bearbeiten
- Theme-Einstellungen für freigegebene Farben, Logo und Schriftvarianten

Wichtig:
- kein freier Pixel-Editor
- kein beliebiges HTML, CSS oder JavaScript durch Kunden
- keine Designoptionen, die Barrierefreiheit oder Mobilansicht offensichtlich zerstören
- optimistische Updates nur mit sauberer Fehlerbehandlung
- Tastaturbedienung beim Sortieren berücksichtigen

Ergänze E2E-Tests für Bearbeiten, Vorschau, Veröffentlichung und Wiederherstellung.
```

**Abnahme:** Ein technisch unerfahrener Testnutzer kann eine Seite ändern, prüfen und veröffentlichen, ohne das Grunddesign zu zerstören.

---

# 11. Kunden-Backend vollständig machen

```text
Schritt 11: Vervollständige das Kunden-Backend auf Basis der vorhandenen Module.

Bereiche:
- Dashboard
- Website und Seiten
- Navigation
- Führerscheinklassen
- Preise
- Kurse
- Team
- Fahrzeuge
- Standorte und Öffnungszeiten
- Medien
- Anfragen und Kontakte
- Benutzer und Rollen
- Domainstatus
- Rechtliches und Consent-Einstellungen
- allgemeine Einstellungen

Dashboard-Inhalte:
- Veröffentlichungsstatus
- neue Anfragen
- letzte Änderungen
- Domain- und SSL-Hinweisstatus
- unvollständige Pflichtangaben
- gezielte Hinweise auf kommende Funktionen, eindeutig als „In Planung“ markiert

Achte auf verständliche Sprache, sinnvolle leere Zustände und kontextbezogene Hilfe. Implementiere keine erfundenen Kennzahlen.
```

**Abnahme:** Alle im MVP vorgesehenen Kundenaufgaben sind ohne Plattform-Admin-Zugang erledigbar.

---

# 12. Kontaktformulare, Leads und einfaches Kunden-CRM

```text
Schritt 12: Implementiere sichere Kontaktformulare und die einfache Anfrageverwaltung.

Anforderungen öffentliche Formulare:
- konfigurierbare Pflichtfelder
- Einwilligungs-/Datenschutzhinweis mit versioniertem Textbezug
- serverseitige Validierung
- Spam-Schutz über Honeypot, Zeitprüfung und Rate-Limiting; keine unnötige Tracking-Abhängigkeit
- verständliche Erfolgs- und Fehlermeldungen
- keine personenbezogenen Formulardaten in technischen Fehlerlogs

Anfrageverwaltung:
- Status neu, in_bearbeitung, beantwortet, abgeschlossen, spam
- Ansprechpartner und Kontaktdaten
- Führerscheininteresse
- Quelle, Zeitstempel und zugehöriges Formular
- interne Notizen
- zuständiger Benutzer
- Wiedervorlage
- Export und datenschutzgerechte Löschung vorbereiten
- Audit-Log für Status- und Datenänderungen

Sende nach erfolgreicher Anfrage eine Benachrichtigung über die später austauschbare Notification-Schicht. Noch keine SMS- oder WhatsApp-Funktion bauen.
```

**Abnahme:** Eine öffentliche Testanfrage erscheint ausschließlich beim richtigen Mandanten und löst genau eine Benachrichtigung aus.

---

# 13. Plattform-Admin und Akquise-CRM

```text
Schritt 13: Implementiere den internen FahrSeiten-Plattform-Admin.

Plattformverwaltung:
- Mandanten suchen, anlegen, bearbeiten, deaktivieren und einsehen
- Kundenbenutzer einladen und Zugänge verwalten
- Domains und deren Status
- gebuchte Pläne und Feature-Freigaben
- Onboarding-Checkliste
- interne Notizen
- Audit- und Aktivitätsübersicht
- sichere Support-Ansicht ohne unprotokolliertes Übernehmen fremder Konten

Akquise-CRM:
- Unternehmen/Fahrschule
- Ansprechpartner
- Telefon, E-Mail und bestehende Website
- Leadquelle
- Pipeline: neu, kontaktiert, interessiert, Demo, Angebot, gewonnen, verloren
- Notizen und Aktivitäten
- nächste Aufgabe und Wiedervorlage
- Verantwortlicher
- Verlustgrund
- Umwandlung eines gewonnenen Leads in einen Mandanten ohne doppelte Dateneingabe

Plattformrollen müssen unterschiedliche Rechte besitzen. platform_sales darf keine sicherheitskritischen Systemeinstellungen ändern; platform_support darf keine Tarife oder Eigentümerrollen ungeprüft verändern.
```

**Abnahme:** Akquise, Kundenanlage und Onboarding können nachvollziehbar im System durchgeführt werden.

---

# 14. E-Mail, Benachrichtigungen und Hintergrundjobs

```text
Schritt 14: Implementiere die technische Benachrichtigungs- und Jobgrundlage.

Anforderungen:
- SMTP-Konfiguration ausschließlich über Umgebungsvariablen
- versionierbare E-Mail-Vorlagen
- Text- und HTML-Version
- zentrale Notification-Schnittstelle
- Zustellstatus und begrenzte Fehlermeldungen ohne sensible Inhalte
- idempotente Jobs, damit Wiederholungen keine doppelten E-Mails verursachen
- Retry-Strategie mit Begrenzung
- Scheduler, der über einen einzelnen Cron-Einstieg aufgerufen werden kann
- Jobs für Anfragebenachrichtigung, Passwort-Reset, Einladung und Wiedervorlage
- spätere Kanäle SMS und WhatsApp nur als Schnittstelle vorsehen, nicht implementieren
- lokaler Mail-Catcher beziehungsweise sicherer Testmodus

Dokumentiere die Ausführung auf Shared Hosting sowie die spätere Umstellung auf einen dauerhaften Worker auf einem VPS.
```

**Abnahme:** Jobs können mehrfach angestoßen werden, ohne unerwünschte Doppelzustellung zu erzeugen.

---

# 15. Tarife, Feature-Flags und kommende Funktionen

```text
Schritt 15: Implementiere das Berechtigungsfundament für Tarife und kommende Funktionen.

Anforderungen:
- zentrale Feature-Definitionen
- Plan enthält standardmäßig freigeschaltete Features
- mandantenspezifische Überschreibungen
- serverseitige Prüfung; ausgeblendete Navigation allein reicht nicht
- Featurestatus: unavailable, coming_soon, beta, enabled
- keine fest codierten Planvergleiche über die gesamte Anwendung verteilen
- Plattform-Admin kann Features kontrolliert freischalten
- Kunden sehen verständlich, welche Funktion verfügbar oder geplant ist
- geplante Funktionen dürfen keinen funktionslosen aktiven Button vortäuschen
- Audit-Log bei Freischaltungen

Bereite Feature-Schlüssel für Erinnerungen, Terminbuchung, erweitertes CRM, SMS, WhatsApp, Zahlungen und Statistiken vor. Implementiere diese Fachfunktionen noch nicht.
```

**Abnahme:** Ein Feature kann pro Tarif oder Mandant freigeschaltet werden und ist ohne Berechtigung auch über direkte Requests nicht nutzbar.

---

# 16. FahrSeiten-Vertriebswebsite

```text
Schritt 16: Erstelle die öffentliche Vertriebswebsite für „FahrSeiten – by ENJO MEDIA“.

Seiten:
- Startseite
- Funktionen
- Design/Demo
- Preise
- FAQ
- Kontakt beziehungsweise Beratung
- Login
- Impressum
- Datenschutz
- Cookie-Einstellungen
- Fehler melden

Anforderungen:
- hochwertiges, eigenständiges Design passend zum vorhandenen Designsystem
- klare Positionierung für Fahrschulen
- funktionierende Demo-Verlinkung
- klare Abgrenzung zwischen verfügbaren und geplanten Funktionen
- keine erfundenen Kundenstimmen oder Kennzahlen
- gute mobile Darstellung
- Performance, SEO-Basis, Open-Graph-Daten, Sitemap und robots.txt
- Kontaktanfragen der Vertriebsseite landen im Akquise-CRM, nicht bei einem Kundenmandanten
- Preise zunächst zentral konfigurierbar und nicht an mehreren Stellen fest codiert

Verwende für fehlende endgültige Texte klar gekennzeichnete redaktionelle Platzhalter und dokumentiere sie.
```

**Abnahme:** Die Vertriebsseite ist vollständig navigierbar, ehrlich formuliert und mit Demo, Login und Akquise verbunden.

---

# 17. Datenschutz-, Consent- und Rechtsgrundlagen technisch umsetzen

```text
Schritt 17: Implementiere die technischen Datenschutz- und Consent-Grundlagen. Erstelle keine Behauptung, dass die Plattform dadurch automatisch rechtssicher oder DSGVO-zertifiziert sei.

Anforderungen:
- eigenes Impressum und Datenschutz für FahrSeiten
- separate, mandantenspezifische Rechtstexte für Kundenwebsites
- Pflichtangaben und Veröffentlichungswarnungen
- versionierte Einwilligungs- und Datenschutzhinweise
- Consent-Kategorien: notwendig, funktional, Statistik, Marketing
- standardmäßig keine optionalen Skripte vor Einwilligung laden
- externe Karten, Videos und vergleichbare Inhalte blockieren, bis die notwendige Freigabe vorliegt
- Einwilligung widerrufbar und erneut konfigurierbar
- Consent-Nachweis datensparsam gestalten
- Datenexport, Löschanforderung und Aufbewahrungsregeln technisch vorbereiten
- Liste der eingesetzten Unterauftragnehmer konfigurierbar halten
- sensible Daten aus Logs und Fehlerberichten entfernen

Erstelle eine /docs/legal-review-checklist.md mit Punkten, die vor dem Produktivstart rechtlich geprüft werden müssen.
```

**Abnahme:** Optionale Dienste bleiben ohne Zustimmung technisch blockiert; Mandanten können eigene Pflichttexte pflegen.

---

# 18. Fehlerberichte, Monitoring und Support

```text
Schritt 18: Implementiere Fehler-, Status- und Supportgrundlagen.

Anforderungen:
- nutzerfreundliche Fehlerseiten mit Referenz-ID
- Formular „Fehler melden“ für FahrSeiten und Kunden-Backend
- Supporttickets mit Status, Priorität, Mandant und Verlauf
- technische Logs mit strukturierten, redigierten Daten
- keine Passwörter, Tokens, vollständigen Formulareingaben oder unnötigen personenbezogenen Daten protokollieren
- Health- und Readiness-Prüfung
- Audit-Logs von technischen Logs trennen
- vorbereiteter Monitoring-Adapter, damit später ein externer oder selbst gehosteter Dienst angebunden werden kann
- Plattform-Admin-Übersicht für aktuelle Fehler und fehlgeschlagene Jobs

Teste bewusst Fehlerfälle, ohne produktive Benachrichtigungen oder externe Dienste auszulösen.
```

**Abnahme:** Fehler sind nachvollziehbar, ohne sensible Kundendaten in Logs offenzulegen.

---

# 19. Sicherheit, Qualität und Barrierefreiheit härten

```text
Schritt 19: Führe vor jedem Deployment eine vollständige technische Härtung durch und behebe die gefundenen Probleme im vereinbarten Umfang.

Prüfbereiche:
- Authentifizierung und Session-Sicherheit
- serverseitige Autorisierung
- Cross-Tenant-Isolation
- CSRF, XSS, SQL-Injection und offene Weiterleitungen
- Upload-Sicherheit
- Rate-Limiting
- Security-Header und Content Security Policy
- Secret- und Umgebungsvariablenhandhabung
- Fehlermeldungen ohne Informationsleck
- Abhängigkeiten und bekannte Schwachstellen
- Datenbankindizes und langsame Abfragen
- mobile Darstellung
- Tastaturbedienung, Fokus, Labels, Kontraste und reduzierte Bewegung
- Build, Linting, Typprüfung, Unit-, Integrations- und E2E-Tests

Erstelle einen nachvollziehbaren Bericht unter docs/release-readiness.md mit bestanden, offen, Risiko und notwendiger Maßnahme. Keine offenen kritischen Sicherheitsfehler akzeptieren.
```

**Abnahme:** Release-Readiness-Bericht ohne offene kritische Punkte; Kernabläufe sind durch E2E-Tests abgedeckt.

---

# 20. Netcup-Staging vorbereiten

```text
Schritt 20: Bereite ein Staging-Deployment für netcup Webhosting 8000 vor. Noch keine Produktivdomains umstellen und keine echten Kundendaten verwenden.

Prüfe und dokumentiere zuerst:
- verfügbare Node.js-Version und Startmechanismus
- Next.js-Build und geeigneter Output-Modus
- Umgebungsvariablen
- MySQL-Verbindung
- Schreibrechte und Uploadpfade
- Cron-Aufruf
- Reverse-Proxy- und Host-Header-Verhalten
- mehrere Testdomains auf derselben Anwendung
- SSL pro Testdomain
- Restart- und Rollbackprozess

Erstelle:
- reproduzierbaren Build- und Deploymentablauf
- staging-spezifische Konfigurationsanleitung
- Datenbank-Migrationsablauf mit Backup-Schritt
- Healthcheck nach Deployment
- Rollback-Anleitung
- Liste aller manuellen Schritte im netcup-WCP

Stoppe vor jeder Aktion, die Zugangsdaten, DNS-Änderungen, externe Freigaben oder ein tatsächliches Deployment benötigt, und fordere dafür gezielt meine Entscheidung an.
```

**Abnahme:** Der Ablauf ist reproduzierbar dokumentiert und wurde ausschließlich mit Staging-/Testdaten geprüft.

---

# 21. Pilotkunde und Produktivstart

```text
Schritt 21: Bereite den kontrollierten Pilotbetrieb mit genau einem Test- beziehungsweise Pilotmandanten vor.

Aufgaben:
- Onboarding-Checkliste vollständig durchspielen
- Inhalte und Medien importieren
- Domainverifikation und SSL prüfen
- Rollen und Einladungen testen
- öffentliche Website auf Mobilgerät und Desktop prüfen
- Kontaktanfrage Ende-zu-Ende testen
- Builder, Vorschau, Veröffentlichung und Wiederherstellung testen
- Impressum, Datenschutz und Consent-Konfiguration prüfen
- Backup erstellen und Wiederherstellungsablauf testen
- Monitoring, Fehlerberichte und Benachrichtigungen prüfen
- Export- und Kündigungs-/Übergabeprozess dokumentieren

Produktivaktionen nur nach meiner ausdrücklichen Freigabe durchführen. Dokumentiere Pilotfeedback getrennt nach Fehler, Bedienproblem, Wunsch und späterer Funktion. Ändere den MVP-Umfang nicht ungefragt aufgrund einzelner Wünsche.
```

**Abnahme:** Ein Pilotmandant kann vollständig betrieben, bearbeitet, gesichert und bei Bedarf exportiert werden.

---

## Vorgehen bei jedem abgeschlossenen Schritt

Nach jeder Codex-Antwort:

1. Prüfen, ob wirklich nur der aktuelle Schritt bearbeitet wurde.
2. Genannte Tests und Prüfergebnisse ansehen.
3. Manuelle Prüfanleitung selbst durchgehen.
4. Offene Risiken klären.
5. Änderungen committen, wenn der Stand funktioniert.
6. Erst danach den nächsten Prompt senden.

Bei einem Fehler wird nicht sofort der nächste Hauptschritt gestartet. Stattdessen erhält Codex einen Reparaturauftrag nach folgendem Muster:

```text
Behebe ausschließlich die folgenden Probleme aus Schritt X:
- [Problem 1]
- [Problem 2]

Untersuche zuerst die Ursache, bewahre funktionierende und nicht betroffene Änderungen und erweitere die Tests so, dass der Fehler künftig erkannt wird. Führe Schritt X nicht neu von vorn aus und beginne noch nicht mit Schritt X+1. Beende die Arbeit mit Ursache, Lösung, Tests und manueller Prüfanleitung.
```

---

## Empfohlene Meilensteine

### Meilenstein A – Fundament

Schritte 1 bis 6: Dokumentation, Projektbasis, Mandanten, Authentifizierung, Domains und Designsystem.

### Meilenstein B – Websiteprodukt

Schritte 7 bis 10: CMS, Fahrschulmodule, Medien und Builder.

### Meilenstein C – Verkaufbarer MVP

Schritte 11 bis 17: Kunden-Backend, Anfragen, Akquise, Jobs, Tarife, Vertrieb und Datenschutztechnik.

### Meilenstein D – Betriebsbereit

Schritte 18 bis 21: Monitoring, Härtung, Staging und Pilotbetrieb.

---

## Funktionen nach dem MVP

Erst nach einem erfolgreichen Pilotbetrieb einzeln planen und umsetzen:

- Fahrstunden- und Terminplanung
- automatische Erinnerungen
- Schülerverwaltung
- WhatsApp- und SMS-Kanäle
- Zahlungsabwicklung und Abonnements
- automatisches Domain-Provisioning
- Kunden-Self-Service-Onboarding
- Statistiken und Conversion-Auswertung
- Bewertungsintegrationen
- Schnittstellen und Webhooks

Für jede dieser Funktionen wird später ein eigener Mini-Laufplan aus Spezifikation, Datenmodell, Rechteprüfung, Umsetzung, Tests und kontrollierter Freigabe erstellt.
