# FahrSeiten – vollständiger Masterprompt für Codex

Den folgenden Prompt in einem neuen Codex-Chat innerhalb des lokalen Git-Repositories `ENJOMEDIA/fahrseiten` senden.

---

```text
Du arbeitest ab jetzt am Projekt „FahrSeiten – by ENJO MEDIA“.

Repository:
git@github.com:ENJOMEDIA/fahrseiten.git

Arbeitsumgebung:
- Entwicklung lokal auf meinem Mac
- GitHub ist die zentrale und von überall erreichbare Quelle
- netcup Webhosting 8000 ist zunächst das geplante Staging-/Produktivhosting
- Produktivdeployment, DNS-Änderungen und echte Kundendaten sind noch nicht freigegeben

Lies vor jeder Änderung zuerst den vollständigen aktuellen Repository-Stand, vorhandene Dokumentation, AGENTS.md und insbesondere die Datei:

docs/FahrSeiten-Codex-Laufplan.md

Der Laufplan und dieser Masterprompt bilden gemeinsam die verbindliche Produkt- und Umsetzungsgrundlage. Bei einem Widerspruch stoppst du und nennst ihn, statt stillschweigend eine Variante auszuwählen.

==================================================
1. PRODUKTVISION
==================================================

FahrSeiten ist eine vollständig eigenentwickelte, mandantenfähige Plattform für moderne Fahrschulwebsites. Das Produkt wird von ENJO MEDIA betrieben und soll später gegen eine Einrichtungsgebühr und/oder monatliche Gebühr an mehrere Fahrschulen angeboten werden.

Die Marke wird öffentlich als „FahrSeiten – by ENJO MEDIA“ geführt.

FahrSeiten ist ausdrücklich:
- kein WordPress,
- kein WordPress-Theme,
- kein Plugin-System auf Basis eines fremden CMS,
- keine Sammlung kopierter Einzelinstallationen,
- kein eingebetteter externer Website-Baukasten.

Die Plattform, das Datenmodell, die Geschäftslogik, der Website-Builder, die Verwaltungsoberflächen und die öffentlichen Kundenseiten werden eigenständig entwickelt. Bewährte Programmbibliotheken dürfen eingesetzt werden, sofern sie sinnvoll, sicher, aktiv gepflegt und mit dem gewählten Stack kompatibel sind. Kernfunktionen dürfen nicht von einem externen SaaS-Baukasten abhängig sein.

Ziel ist ein Produkt, das für technisch unerfahrene Fahrschulinhaber verständlich ist. Kunden sollen Inhalte selbst pflegen können, ohne das professionelle Design ihrer Website versehentlich zu zerstören.

==================================================
2. GRUNDARCHITEKTUR
==================================================

Es wird eine zentrale Anwendung und eine gemeinsame Codebasis betrieben. Es gibt nicht für jeden Kunden eine neue Installation.

Die Plattform besteht aus folgenden Bereichen:

1. fahrseiten.de
   - öffentliche Vertriebs- und Produktwebsite
   - Funktionen, Designs, Preise, Demo, FAQ, Kontakt und Login

2. app.fahrseiten.de
   - Login
   - Kunden-Backend
   - Plattform-Admin von ENJO MEDIA
   - internes Akquise-CRM

3. demo.fahrseiten.de
   - öffentliche Demonstrationswebsite einer vollständig fiktiven Fahrschule

4. individuelle Kundendomains
   - zum Beispiel fahrschule-mueller.de
   - jede Domain zeigt auf dieselbe zentrale Anwendung
   - die Anwendung löst anhand des angefragten Hostnamens den richtigen Mandanten auf

5. optionale Vorschau-Subdomains
   - beispielsweise kundenname.fahrseiten.de
   - für Entwurf, Onboarding oder Vorschau

Jede Fahrschule ist ein eigener Mandant. Daten, Benutzer, Medien, Anfragen, Domains, Einstellungen und Veröffentlichungen müssen strikt getrennt sein.

Zunächst wird eine gemeinsame MySQL-/MariaDB-Datenbank genutzt. Alle mandantengebundenen Datensätze erhalten eine tenant_id. Die Trennung wird nicht nur in der Oberfläche, sondern in der serverseitigen Architektur und den Tests erzwungen.

Eine tenant_id, Domain, Rolle oder Benutzer-ID aus dem Browser darf niemals allein als vertrauenswürdig gelten. Der Server muss den Mandanten aus einem geprüften Kontext bestimmen und jede Berechtigung serverseitig kontrollieren.

==================================================
3. TECHNISCHER ZIELRAHMEN
==================================================

Geplanter Stack:
- Next.js mit App Router
- React
- TypeScript im Strict Mode
- Tailwind CSS
- eigenes, wiederverwendbares Designsystem
- MySQL oder MariaDB
- Drizzle ORM
- versionierte Datenbankmigrationen
- Zod oder eine vergleichbare zentrale Laufzeitvalidierung
- sichere datenbankgestützte Authentifizierung
- SMTP für transaktionale E-Mails
- ein Scheduler, der zunächst über einen einzelnen Cron-Einstieg ausgeführt werden kann
- austauschbarer Storage-Adapter: zunächst Webhosting-/Dateisystem, später S3-kompatibler Speicher
- Unit-, Integrations- und E2E-Tests

Das Projekt bleibt zunächst eine modulare Anwendung. Es wird keine unnötige Microservice-Landschaft aufgebaut.

Die Architektur muss auf dem netcup Webhosting 8000 startfähig sein, darf aber keine harte Abhängigkeit von dessen Oberfläche oder Verzeichnisstruktur besitzen. Ein späterer Umzug auf einen VPS muss ohne Neuentwicklung der Fachlogik möglich sein.

Die konkrete Node.js-, Next.js-, Authentifizierungs- und Deployment-Konfiguration wird vor ihrer Einführung auf Kompatibilität mit den im Repository tatsächlich eingesetzten Versionen geprüft und als Architecture Decision Record dokumentiert.

Keine Abhängigkeit anhand bloßer Erinnerung auswählen. Prüfe vor sicherheits- oder versionskritischen Entscheidungen die aktuelle offizielle Dokumentation der betreffenden Technologie.

==================================================
4. BENUTZER UND ROLLEN
==================================================

Vorgesehene Rollen:

Plattformrollen:
- platform_owner: vollständige Plattformverwaltung
- platform_sales: Akquise, Leads, Angebote und Onboarding; keine sicherheitskritischen Systemeinstellungen
- platform_support: Support- und Diagnosezugriff; keine ungeprüften Tarif-, Eigentümer- oder Sicherheitsänderungen

Mandantenrollen:
- tenant_owner: Inhaber beziehungsweise Hauptadministrator der Fahrschule
- tenant_editor: darf Inhalte und definierte Geschäftsdaten bearbeiten
- tenant_viewer: ausschließlich lesender Zugriff auf freigegebene Bereiche

Ein Benutzer kann Mitglied mehrerer Mandanten sein. Plattformrollen und Mandantenrollen werden strikt getrennt.

Sicherheitsrelevante Aktionen, Rollenänderungen, Veröffentlichungen, Feature-Freischaltungen und Supportzugriffe müssen nachvollziehbar protokolliert werden.

==================================================
5. FUNKTIONSUMFANG DES MVP
==================================================

Das erste verkaufbare MVP enthält die folgenden Bereiche und Funktionen.

--------------------------------------------------
5.1 FahrSeiten-Vertriebswebsite
--------------------------------------------------

Seiten und Funktionen:
- Startseite
- Funktionen
- Design- beziehungsweise Templateübersicht
- Live-Demo
- Preise
- FAQ
- Kontakt und Beratungsanfrage
- Login
- Impressum
- Datenschutz
- Cookie-/Consent-Einstellungen
- Fehler melden

Anforderungen:
- hochwertige, moderne, ruhige und eigenständige Gestaltung
- klarer Qualitätsbezug zu ENJO MEDIA
- mobil zuerst und performant
- barrierearme beziehungsweise WCAG-orientierte Umsetzung
- klare Trennung zwischen bereits verfügbaren und geplanten Funktionen
- keine erfundenen Kundenstimmen, Kundenlogos oder Kennzahlen
- keine Veröffentlichungstermine versprechen, die nicht freigegeben sind
- Preise zentral konfigurierbar statt mehrfach fest codiert
- Vertriebsanfragen landen im internen FahrSeiten-Akquise-CRM und niemals im CRM eines Kundenmandanten
- SEO-Basis, Sitemap, robots.txt, Open-Graph-Metadaten und saubere semantische Struktur

--------------------------------------------------
5.2 Öffentliche Fahrschulwebsites
--------------------------------------------------

Mögliche Seiten:
- Startseite
- Führerscheinklassen
- Preise
- Kurse und Termine
- Über uns
- Team/Fahrlehrer
- Fuhrpark
- Standorte
- Öffnungszeiten
- FAQ
- Kontakt
- Impressum
- Datenschutz

Die Seiten können je Mandant aktiviert, deaktiviert, sortiert und in der Navigation konfiguriert werden.

Öffentliche Websites benötigen:
- individuelles Logo, Farben und freigegebene Schriftvarianten
- responsive Darstellung
- SEO-Titel und Beschreibungen
- kanonische URLs
- strukturierte Daten, sofern fachlich korrekt
- Entwurfs-, Vorschau- und Veröffentlichungszustand
- schnelle Auslieferung und geeignete Cache-Invalidierung
- verständliche Fehler- und Nicht-gefunden-Seiten

--------------------------------------------------
5.3 Fahrschulspezifische Inhaltsmodule
--------------------------------------------------

Zum MVP gehören:
- Führerscheinklassen
- Preisgruppen und Preispositionen
- Kurse und Kurstermine
- Fahrlehrer und Team
- Fahrzeuge und Fuhrpark
- Standorte
- Öffnungszeiten
- FAQ
- manuell gepflegte Bewertungen beziehungsweise Zitate

Alle Modelle sind mandantengebunden, validiert, sortierbar und aktivierbar. Geldwerte werden als exakte Dezimalwerte und niemals als ungenaue Fließkommazahlen behandelt.

--------------------------------------------------
5.4 Eigener Website-Builder
--------------------------------------------------

Der Builder ist ein geführter Block-Editor und kein freier Pixel-Editor.

Kunden dürfen:
- Seiten anlegen und bearbeiten
- freigegebene Blöcke hinzufügen
- Blöcke sortieren
- Blöcke duplizieren
- Blöcke ausblenden
- Texte bearbeiten
- Bilder auswählen und austauschen
- vordefinierte Layoutvarianten auswählen
- Logo, Farben und freigegebene Schriftvarianten konfigurieren
- Desktop-, Tablet- und Mobilvorschau anzeigen
- Entwürfe automatisch speichern
- Änderungen veröffentlichen
- Versionshistorie ansehen
- frühere Versionen wiederherstellen
- Navigation verwalten

Vorgesehene Blocktypen:
- Hero
- Text mit Bild
- Vorteile
- Call-to-Action
- Führerscheinklassen
- Preise
- Kurse
- Team/Fahrlehrer
- Fahrzeuge
- Bewertungen
- Standorte
- Öffnungszeiten
- FAQ
- Kontaktformular beziehungsweise Kontaktteaser
- Galerie

Kunden dürfen kein beliebiges HTML, JavaScript oder globales CSS einfügen. Inhalte werden anhand versionsfähiger Schemas validiert. Die Designoptionen dürfen die Mobilansicht, Lesbarkeit oder Barrierefreiheit nicht offensichtlich zerstören.

Es gibt getrennte Zustände für Entwurf und Veröffentlichung. Die öffentliche Domain darf nur veröffentlichte und gültige Inhalte anzeigen. Vorschauen dürfen geschützte Entwürfe darstellen.

--------------------------------------------------
5.5 Kunden-Backend
--------------------------------------------------

Bereiche:
- Dashboard
- Website und Seiten
- Navigation
- Design und Theme
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

Dashboard:
- Veröffentlichungsstatus
- neue Kontaktanfragen
- letzte Änderungen
- Domain- und SSL-Hinweise
- fehlende Pflichtangaben
- gezielte Hinweise auf kommende Funktionen, eindeutig als „In Planung“ gekennzeichnet

Das Backend muss für technisch unerfahrene Nutzer verständlich sein. Verwende klare Sprache, sinnvolle leere Zustände, Bestätigungen, Fehlermeldungen und kontextbezogene Hilfen.

--------------------------------------------------
5.6 Kontaktanfragen und einfaches Kunden-CRM
--------------------------------------------------

Öffentliche Kontaktformulare benötigen:
- mandantenspezifisch konfigurierbare Felder
- serverseitige Validierung
- Spam-Schutz ohne unnötige Tracking-Abhängigkeit
- Rate-Limiting
- Honeypot und Zeitprüfung
- versionierten Datenschutzhinweis
- verständliche Erfolgs- und Fehlerzustände

Anfragen enthalten:
- Status: neu, in_bearbeitung, beantwortet, abgeschlossen oder spam
- Ansprechpartner
- Kontaktdaten
- Führerscheininteresse
- Quelle und zugehöriges Formular
- Zeitstempel
- interne Notizen
- zuständiger Benutzer
- Wiedervorlage
- nachvollziehbare Statusänderungen

Kontakt- und Formulardaten dürfen nicht in technischen Fehlerlogs landen. Export, Löschung und Aufbewahrungsregeln werden technisch vorbereitet.

--------------------------------------------------
5.7 Plattform-Admin von ENJO MEDIA
--------------------------------------------------

Funktionen:
- Mandanten suchen, anlegen, bearbeiten, deaktivieren und einsehen
- Kundenbenutzer einladen und Rollen verwalten
- Domains und Status verwalten
- gebuchte Tarife und Features verwalten
- Onboarding-Checklisten
- interne Notizen
- Supporttickets
- Fehlerberichte
- Audit- und Aktivitätsübersicht
- Job- und Benachrichtigungsstatus
- sichere Supportansicht ohne unprotokollierte Kontoübernahme

--------------------------------------------------
5.8 Internes Akquise-CRM
--------------------------------------------------

Das interne CRM gehört ausschließlich zu FahrSeiten/ENJO MEDIA.

Funktionen:
- Unternehmen/Fahrschule
- Ansprechpartner
- Telefon und E-Mail
- bestehende Website
- Leadquelle
- Notizen und Aktivitäten
- verantwortlicher Mitarbeiter
- nächste Aufgabe und Wiedervorlage
- Verlustgrund
- Pipeline: neu, kontaktiert, interessiert, Demo, Angebot, gewonnen, verloren
- Umwandlung eines gewonnenen Leads in einen Mandanten ohne unnötige doppelte Dateneingabe

Es soll zunächst ein fokussiertes Vertriebs-CRM sein und kein vollständiger Ersatz für alle Funktionen großer CRM-Produkte.

--------------------------------------------------
5.9 Medienverwaltung
--------------------------------------------------

Funktionen:
- mandantengebundene Uploads
- Bilder auswählen, ersetzen und archivieren
- serverseitige Typ- und Größenprüfung
- sichere Dateinamen
- Alt-Texte und optionale Beschreibungen
- Speicherung von Bilddimensionen und notwendigen Metadaten
- responsive und optimierte Ausgabe
- Schutz vor ausführbaren Uploads
- Warnung vor dem Entfernen verwendeter Medien
- später austauschbarer Storage-Adapter

Ein Mandant darf weder Dateipfade noch Medien anderer Mandanten sehen oder abrufen.

--------------------------------------------------
5.10 Domains
--------------------------------------------------

Kundendomains können bei unterschiedlichen Registraren liegen. Die Domain muss nicht zu netcup umgezogen werden.

Domainstatus:
- pending
- verification_required
- verified
- active
- error
- disabled

Vorzubereiten sind:
- normalisierte Hostnamen
- primäre Domain
- optionale www-/Apex-Weiterleitung
- zufälliges TXT-Verifikationstoken
- DNS-Hinweise
- SSL-Status
- sichere Behandlung unbekannter Domains

Zunächst darf das Onboarding teilweise manuell erfolgen. Es wird noch keine automatische Domainregistrierung versprochen.

DNS-, SSL- und netcup-spezifische Änderungen werden erst in einer späteren Stagingphase umgesetzt. Bestehende MX-, SPF-, DKIM- und DMARC-Einträge eines Kunden dürfen durch einen Websiteumzug nicht ungeprüft verändert werden.

==================================================
6. VON ANFANG AN VORZUBEREITENDE GRUNDLAGEN
==================================================

Die folgenden Grundlagen gehören früh in die Architektur, auch wenn die zugehörigen Endfunktionen erst später erscheinen:

- Feature-Flags
- Tarife und Berechtigungen
- mandantenspezifische Feature-Overrides
- Featurestatus unavailable, coming_soon, beta und enabled
- zentrale Notification-Schnittstelle
- idempotente Hintergrundjobs
- Retry-Strategie
- Scheduler/Cron-Einstieg
- Audit-Logs
- versionierte Consent-Texte
- Datenexport und Löschanforderungen
- Aufbewahrungsregeln
- API- und Webhook-fähige Ereignisstruktur
- austauschbarer Datei-/Objektspeicher
- vorbereitete Abrechnungs- und Subscription-Entitäten ohne fertige Zahlungsabwicklung
- Support- und Fehlerreferenzen
- Import-/Export-Grundlage

Feature-Berechtigungen werden immer serverseitig geprüft. Das bloße Ausblenden eines Menüpunktes ist keine Zugriffskontrolle.

==================================================
7. SPÄTERE FUNKTIONEN – NOCH NICHT ALS FERTIGE FEATURES BAUEN
==================================================

Die folgenden Funktionen dürfen öffentlich als „In Planung“ beziehungsweise „Coming soon“ genannt und technisch vorbereitet werden, gehören aber nicht zum ersten MVP:

- Fahrstundenplanung
- Terminbuchung
- Schülerverwaltung
- Erinnerungen an Fahrstunden und Termine
- erweitertes CRM
- E-Mail-Automationen
- SMS-Benachrichtigungen
- WhatsApp-Benachrichtigungen
- Online-Zahlungen
- Abonnements und automatische Rechnungsstellung
- digitale Dokumente
- Bewertungsintegrationen
- erweiterte Statistiken und Conversion-Auswertung
- Google-Business-Integrationen
- automatisches Domain-Provisioning
- automatisches Self-Service-Onboarding
- externe API und Webhooks

Für diese Funktionen werden nur stabile Erweiterungspunkte, Feature-Schlüssel und notwendige Grundmodelle vorbereitet. Keine leeren Attrappen bauen, die in der Oberfläche wie funktionierende Features wirken. Keine erfundenen Veröffentlichungstermine angeben.

==================================================
8. E-MAILS UND HINTERGRUNDJOBS
==================================================

Anforderungen:
- SMTP ausschließlich über Umgebungsvariablen
- Text- und HTML-Versionen
- versionierbare Vorlagen
- Einladungen
- Passwort-Reset
- Anfragebenachrichtigungen
- Wiedervorlagen
- Zustellstatus
- begrenzte und datensparsame Fehlerprotokolle
- idempotente Jobs zur Vermeidung doppelter Zustellungen
- lokaler Mail-Catcher oder sicherer Testmodus

Zunächst wird ein einzelner Cron-Einstieg verwendet, der geplante Jobs verarbeitet. Die Fachlogik wird so entkoppelt, dass später auf einem VPS ein dauerhafter Worker eingesetzt werden kann.

==================================================
9. DATENSCHUTZ UND CONSENT
==================================================

Die Plattform soll technische Datenschutzgrundlagen bereitstellen, darf aber niemals behaupten, allein dadurch automatisch rechtssicher, DSGVO-zertifiziert oder rechtlich geprüft zu sein.

Zu berücksichtigen:
- FahrSeiten/ENJO MEDIA benötigt eigenes Impressum und eigene Datenschutzerklärung
- jeder Mandant benötigt eigene Rechtstexte und Pflichtangaben
- Fahrschulen sind typischerweise Verantwortliche für ihre Interessenten- und Kundendaten
- FahrSeiten/ENJO MEDIA verarbeitet Mandantendaten typischerweise als Auftragsverarbeiter
- für eigene Akquise, Vertragskonto und Abrechnung handelt ENJO MEDIA in eigener Verantwortlichkeit
- AV-Verträge und Unterauftragnehmer müssen organisatorisch berücksichtigt werden

Technische Anforderungen:
- versionierte Rechtstexte und Einwilligungshinweise
- Consent-Kategorien: notwendig, funktional, Statistik, Marketing
- optionale Skripte standardmäßig blockieren
- externe Karten, Videos und vergleichbare Inhalte erst nach erforderlicher Freigabe laden
- Einwilligungen widerrufbar machen
- Nachweis datensparsam speichern
- Lösch- und Exportprozesse vorbereiten
- Aufbewahrungsfristen konfigurierbar machen
- sensible Daten aus Logs und Fehlerberichten entfernen
- rechtliche Prüfliste vor Produktivstart dokumentieren

Für das MVP möglichst ohne Werbetracking arbeiten. Keine unnötigen Drittanbieter einbinden.

==================================================
10. SICHERHEIT
==================================================

Nicht verhandelbare Anforderungen:
- sichere Sessionverwaltung
- sichere Passwort-Hashes
- zeitlich begrenzte Einmal-Tokens
- serverseitige Autorisierung
- konsequente Tenant-Isolation
- CSRF-, XSS- und Injection-Schutz
- Schutz vor offenen Weiterleitungen
- Rate-Limiting für Login, Reset und Formulare
- sichere Uploadprüfung
- Security-Header und geeignete Content Security Policy
- keine Secrets im Repository
- keine echten Kundendaten in Seed-, Test- oder Demo-Daten
- keine Tokens, Passwörter, vollständigen Formulare oder unnötige personenbezogene Daten in Logs
- Audit-Logs für kritische Änderungen
- getrennte Entwicklungs-, Staging- und Produktionskonfiguration
- externe, verschlüsselte Backups und getesteter Wiederherstellungsprozess vor Produktivstart
- Zwei-Faktor-Authentifizierung mindestens für Plattform-Admins vorbereiten; Implementierungszeitpunkt dokumentieren

Jede neue mandantengebundene Fachfunktion benötigt Tests, die Cross-Tenant-Zugriffe explizit verhindern.

==================================================
11. DESIGN UND BEDIENUNG
==================================================

Designrichtung:
- hochwertig
- modern
- ruhig
- professionell
- klar
- mobil zuerst
- keine generische Admin-Template-Optik
- wiedererkennbare FahrSeiten-Marke mit dezentem „by ENJO MEDIA“

Ein zentrales Designsystem enthält:
- Farben
- Typografie
- Abstände
- Radien
- Schatten
- Animationen
- Fokuszustände
- Komponentenvarianten

Barrierefreiheit berücksichtigen:
- semantisches HTML
- Tastaturbedienung
- sichtbare Fokuszustände
- verständliche Labels und Fehlermeldungen
- ausreichende Kontraste
- reduzierte Bewegung berücksichtigen
- keine Bedienung ausschließlich über Farbe vermitteln

Keine erfundenen Statistiken, Kundenlogos, Testimonials oder Erfolgsmeldungen verwenden.

==================================================
12. MONITORING, FEHLER UND SUPPORT
==================================================

Vorzusehen sind:
- benutzerfreundliche Fehlerseiten
- nicht sensible Fehlerreferenz-ID
- Formular „Fehler melden“
- Supporttickets mit Status, Priorität, Mandant und Verlauf
- strukturierte und redigierte technische Logs
- getrennte Audit-Logs
- Health- und Readiness-Prüfung
- Plattformübersicht für fehlgeschlagene Jobs und technische Probleme
- austauschbarer Monitoring-Adapter

Technische Fehler dürfen keine sensiblen Inhalte an den Browser oder in externe Systeme übertragen.

==================================================
13. HOSTING UND INFRASTRUKTUR
==================================================

Geplanter Start:
- netcup Webhosting 8000
- Node.js-Unterstützung
- MySQL/MariaDB
- SSH und Git
- Cronjobs
- SSL

Bekannte Rahmenbedingungen:
- Shared Hosting besitzt weniger Kontrolle als ein VPS
- externe Domains und deren Automatisierung können tariflich oder technisch begrenzt sein
- Domain- und SSL-Aufschaltung kann anfangs manuell erfolgen
- dauerhafte Worker werden zunächst durch Cron-basierte Verarbeitung ersetzt

Die Anwendung darf nicht voraussetzen, dass sie dauerhaft auf Shared Hosting bleibt. Konfigurations-, Storage-, Job- und Deployment-Schnittstellen müssen einen späteren VPS-Betrieb ermöglichen.

Umgebungen:
- lokale Entwicklung auf dem Mac
- Staging ohne echte Kundendaten
- Produktion

Staging und Produktion erhalten getrennte Umgebungsvariablen, Datenbanken, Uploadbereiche und Domains. Keine Entwicklung direkt im produktiven Webroot.

Ein Deployment erfolgt erst in der dafür vorgesehenen Laufplanphase. Vorher werden keine Produktivdomains, DNS-Einträge oder Kundendaten verändert.

==================================================
14. GIT- UND ARBEITSWEISE
==================================================

GitHub-Repository:
git@github.com:ENJOMEDIA/fahrseiten.git

Regeln:
- main bleibt stabil und grundsätzlich releasefähig
- keine direkte Arbeit auf main, abgesehen von einer ausdrücklich freigegebenen initialen Repository-Einrichtung
- pro Laufplanschritt ein eigener Branch, zum Beispiel phase/01-produktspezifikation
- nur zum Schritt gehörende Dateien committen
- keine fremden oder bereits vorhandenen Änderungen überschreiben
- keine destruktiven Git-Befehle wie reset --hard oder checkout -- ohne ausdrücklichen Auftrag
- keine Secrets, .env-Dateien, Uploads, Logs, node_modules oder Buildartefakte committen
- .env.example enthält nur Platzhalter und Dokumentation
- verständliche Commit-Nachrichten
- Branch zu origin pushen
- Merge in main erfolgt erst nach meiner Prüfung, nicht selbstständig

Vor jeder Änderung:
1. Repository-Status prüfen
2. relevante Dateien lesen
3. bestehende Änderungen respektieren
4. aktuellen Laufplanschritt und dessen Grenzen nennen

Nach jedem Schritt:
1. Linting ausführen
2. Typprüfung ausführen
3. relevante Tests ausführen
4. soweit sinnvoll Build ausführen
5. manuelle Prüfanleitung liefern
6. geänderte Dateien auflisten
7. Annahmen, Risiken und offene Punkte nennen
8. noch nicht committen oder pushen, bis ich die Prüfung freigebe

Nach meiner Freigabe:
- passenden Branch erstellen beziehungsweise verwenden
- Prüfungen erneut ausführen
- Änderungen committen
- Branch zu origin pushen
- nicht in main mergen
- Branchname, Commit-Hash und verbleibende uncommittete Dateien nennen

==================================================
15. DOKUMENTATION
==================================================

Mindestens folgende Dokumentation soll im Verlauf entstehen und aktuell gehalten werden:
- README.md
- AGENTS.md
- docs/product-scope.md
- docs/architecture.md
- docs/roles-and-permissions.md
- docs/roadmap.md
- docs/domain-onboarding.md
- docs/deployment.md
- docs/security.md
- docs/legal-review-checklist.md
- docs/release-readiness.md
- docs/decisions/ für Architecture Decision Records

Dokumentation muss den tatsächlichen Stand beschreiben. Keine Funktionen als fertig darstellen, die nur geplant oder vorbereitet sind.

==================================================
16. UMSETZUNGSREIHENFOLGE
==================================================

Die Umsetzung erfolgt ausschließlich schrittweise nach docs/FahrSeiten-Codex-Laufplan.md.

Übergeordnete Reihenfolge:

Meilenstein A – Fundament
- Repository und Produktspezifikation
- technisches Grundgerüst
- Datenbank und Mandantentrennung
- Authentifizierung und Rollen
- Domain- und Tenant-Auflösung
- Designsystem

Meilenstein B – Websiteprodukt
- Seiten-, Block- und Veröffentlichungssystem
- fahrschulspezifische Inhaltsmodule
- Medienverwaltung
- visueller Block-Builder

Meilenstein C – Verkaufbarer MVP
- vollständiges Kunden-Backend
- Kontaktanfragen und einfaches Kunden-CRM
- Plattform-Admin und Akquise-CRM
- E-Mail und Hintergrundjobs
- Tarife und Feature-Flags
- Vertriebswebsite
- Datenschutz- und Consent-Grundlagen

Meilenstein D – Betriebsbereit
- Fehlerberichte, Monitoring und Support
- Sicherheits-, Qualitäts- und Barrierefreiheitshärtung
- netcup-Staging
- kontrollierter Pilotbetrieb

Beginne niemals ungefragt mit dem nächsten Schritt. Wenn ein Schritt blockiert ist, dokumentiere den konkreten Blocker und stoppe.

==================================================
17. DEFINITION OF DONE
==================================================

Eine Funktion gilt nur als abgeschlossen, wenn:
- sie dem freigegebenen Umfang entspricht
- Mandanten- und Rollenprüfung serverseitig funktioniert
- Eingaben validiert werden
- Lade-, Leer-, Erfolgs- und Fehlerzustände vorhanden sind
- sinnvolle Tests existieren und erfolgreich laufen
- bestehende Tests weiterhin erfolgreich sind
- relevante Dokumentation aktualisiert ist
- keine Secrets oder echten Kundendaten enthalten sind
- Barrierefreiheit und mobile Darstellung berücksichtigt wurden
- keine späteren Features unbeabsichtigt vorweggenommen wurden
- bekannte Einschränkungen offen dokumentiert sind

==================================================
18. DEIN JETZIGER AUFTRAG
==================================================

Baue jetzt noch nicht die komplette Plattform.

Führe ausschließlich folgende Arbeit aus:

1. Prüfe den aktuellen Repository-Status, die Branches, das konfigurierte Remote und vorhandene Dateien.
2. Lies docs/FahrSeiten-Codex-Laufplan.md vollständig.
3. Vergleiche den Laufplan mit diesem Masterprompt.
4. Nenne Widersprüche, fehlende Entscheidungen oder technische Blocker. Triff keine geschäftskritische Annahme stillschweigend.
5. Erstelle oder aktualisiere eine AGENTS.md, die die dauerhaften Arbeits-, Sicherheits-, Git- und Prüfregeln dieses Projekts präzise zusammenfasst. Kopiere dabei nicht unnötig den gesamten Produkttext, sondern verweise für Produktumfang und Phasen auf die Dokumentation.
6. Bearbeite anschließend ausschließlich Schritt 1 „Repository prüfen und Produktspezifikation anlegen“ aus dem Laufplan.
7. Implementiere noch keine Fachfunktionen, Datenbank, Anmeldung, Benutzeroberfläche oder Deploymentkonfiguration.
8. Führe keine Produktivaktion und keine externe Änderung aus.

Beende deine Antwort mit:
- kurzer Zusammenfassung des verstandenen Produkts
- Ergebnis von Schritt 1
- geänderten beziehungsweise neu angelegten Dateien
- ausgeführten Prüfungen und deren Ergebnissen
- Widersprüchen, offenen Entscheidungen und Annahmen
- Risiken
- genauer manueller Prüfanleitung für mich
- vorgeschlagenem Branchnamen und Commit-Nachricht

Committe und pushe noch nichts. Warte nach Abschluss ausdrücklich auf meine Freigabe.
```

---

## Freigabeprompt nach erfolgreicher Kontrolle

```text
Ich habe das Ergebnis von Schritt 1 geprüft und gebe es frei.

Prüfe vor dem Commit erneut den Repository-Status und stelle sicher, dass nur die zu Schritt 1 gehörenden Änderungen enthalten sind. Führe alle für diesen Schritt sinnvollen Prüfungen erneut aus.

Erstelle beziehungsweise verwende den Branch:
phase/01-produktspezifikation

Committe die freigegebenen Änderungen mit einer verständlichen Commit-Nachricht und pushe den Branch zu origin.

Führe keinen Merge in main durch und beginne noch nicht mit Schritt 2.

Nenne mir danach:
- Branchname
- Commit-Hash
- Push-Ergebnis
- ausgeführte Prüfungen
- noch nicht committete Dateien
- Link beziehungsweise Hinweis zum Erstellen des Pull Requests
```
