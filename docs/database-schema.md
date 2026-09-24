# Datenbankschema und Mandantentrennung

Stand: Phase 3. Das code-first Schema liegt in `src/db/schema.ts`; versionierte SQL-Migrationen liegen unter `drizzle/`.

```mermaid
erDiagram
  TENANTS ||--o{ TENANT_MEMBERSHIPS : hat
  USERS ||--o{ TENANT_MEMBERSHIPS : besitzt
  TENANTS ||--o{ DOMAINS : nutzt
  TENANTS ||--|| SITES : betreibt
  TENANTS ||--o{ SUBSCRIPTIONS : hat
  TENANTS ||--o{ CONTRACT_DOCUMENTS : besitzt
  CONTRACT_DOCUMENTS ||--o{ SIGNATURE_REQUESTS : wird_unterzeichnet
  SIGNATURE_REQUESTS ||--o{ SIGNATURE_EVENTS : protokolliert
  PLANS ||--o{ SUBSCRIPTIONS : gilt_fuer
  PLANS ||--o{ PLAN_FEATURES : enthaelt
  FEATURE_FLAGS ||--o{ PLAN_FEATURES : definiert
  TENANTS ||--o{ TENANT_FEATURES : ueberschreibt
  FEATURE_FLAGS ||--o{ TENANT_FEATURES : definiert
  TENANTS ||--o{ AUDIT_LOGS : betrifft
  USERS ||--o{ AUDIT_LOGS : handelt
```

## Tabellen

- `tenants`: Fahrschulen mit stabilem UUID-Bezeichner, Slug und deaktivierbarem Status.
- `users`: Plattformweite Identitäten; Plattformrolle und Tenant-Mitgliedschaften bleiben getrennt.
- `platform_settings`: Anbieter-, Kontakt-, Design- und Wartungsstatus der zentralen FahrSeiten-Plattform.
- `tenant_onboarding_tokens`: nur als Hash gespeicherte, ablaufende und einmal verwendbare Einrichtungslinks für neue Mandanten.
- `sessions`, `password_reset_tokens`, `auth_rate_limits`: gehashte Authentifizierungstokens, Ablauf und vorbereitete persistente Drosselung.
- `tenant_memberships`: aktive Rolle eines Benutzers innerhalb genau eines Mandanten.
- `domains`: normalisierte, global eindeutige Hostnamen und Onboarding-/SSL-Status.
- `sites`: mandantengebundene Website-Grundeinstellungen einschließlich Wartungsstatus und Vorschautext.
- `plans`, `subscriptions`: vorbereitete Tarifzuordnung ohne Zahlungsabwicklung.
- `contract_documents`: unveränderliche tenantgebundene Vertrags-PDFs mit
  Vertragsnummer, SHA-256-Prüfsumme, Status und optionaler signierter Fassung
  sowie Prüfprotokoll.
- `signature_requests`, `signature_events`: anbieterneutrale Signaturvorgänge
  und idempotente, anhand ihres Inhalts gehashte Anbieterereignisse. Externe
  IDs, Unterzeichner und Status sind stets zusätzlich an `tenant_id` und das
  konkrete Vertragsdokument gebunden.
- `feature_flags`, `plan_features`, `tenant_features`: zentrale Features, Planstandard und Mandanten-Override.
- `legal_profiles`: validierte Anbieter- und Datenschutzangaben sowie aktivierte Rechtsmodule; Plattformprofil und Tenant-Profile bleiben über Scope und `tenant_id` getrennt.
- `media_assets` und `media_usages`: geprüfte Bildmetadaten, stabile Speicherschlüssel und Verwendungen; Tenant-Medien tragen immer ihre `tenant_id`, Plattformmedien verwenden ausschließlich den ausdrücklich geprüften Plattformkontext.
- `platform_settings.logo_media_id`/`favicon_media_id` und `theme_settings.logo_media_id`/`favicon_media_id`: getrennt ausgewählte Seitenlogos und Browser-Symbole für FahrSeiten beziehungsweise den jeweiligen Mandanten.
- `legal_documents`: versionierte, aus dem jeweiligen Rechtsprofil erzeugte Entwürfe und veröffentlichte Snapshots für Impressum und Datenschutz.
- `audit_logs`: append-orientierte sicherheitsrelevante Ereignisse; mandantenübergreifende Plattformereignisse dürfen `tenant_id = NULL` verwenden.

## Isolationsregel

Jede fachliche Tabelle mit Mandantendaten erhält `tenant_id`. Serverseitige Dienste bekommen einen geprüften `TenantContext`; eine ID aus Request, URL oder Formular erzeugt allein keinen Kontext. Objektzugriffe müssen `tenant_id` in derselben Abfrage einschränken. Die Datenbank ist eine zusätzliche Persistenzgrenze, ersetzt aber keine Autorisierung.

Cross-Tenant-Tests prüfen ab Phase 3, dass Mitgliedschaften und Objekte anderer Mandanten abgewiesen werden. Medien, Inhalte, Anfragen und Jobs werden serverseitig an denselben geprüften Tenant-Kontext gebunden; Cache-Schlüssel müssen dieser Regel ebenfalls folgen.

## Migrationen und lokaler Seed

```bash
pnpm db:generate
pnpm db:check
pnpm db:migrate
pnpm db:seed
pnpm db:schema:bundle
```

`db:migrate` und `db:seed` benötigen eine erreichbare lokale MySQL-/MariaDB-Datenbank aus `DATABASE_URL`. Der Seed ist idempotent, ausschließlich für lokale Entwicklung bestimmt und verwendet nur fiktive `.local`-Identitäten. Er darf nicht auf Staging oder Produktion ausgeführt werden.

`db:schema:bundle` erzeugt `dist/sql/fahrseiten-schema.sql` aus sämtlichen versionierten Migrationen. Die Datei ist ausschließlich für eine neue, leere Datenbank bestimmt und schreibt auch den Drizzle-Migrationsstand. Für bestehende Datenbanken werden immer die Migrationen verwendet. Der Produktionsinstaller führt dieselbe Migrationskette aus und erzeugt keine Demo-Daten.

Eine lokale Datenbank war in der Codex-Umgebung nicht verfügbar. Migration und Seed sind reproduzierbar implementiert; die tatsächliche Anwendung gegen MySQL/MariaDB bleibt als dokumentierte lokale Prüfung offen.

## Installation und spätere Mandanten

Es gibt genau eine zentrale FahrSeiten-Installation mit einer gemeinsamen Datenbank. Der geschützte Webinstaller unter `/setup` fragt Host beziehungsweise IP, Port, Datenbankname, Benutzer und Passwort ab, wendet die Migrationen an und legt einmalig den ersten `platform_owner` sowie die Anbieter- und Designstammdaten an. Anschließend speichert er die Datenbankverbindung mit restriktiven Dateirechten in einer persistenten Runtime-Datei außerhalb des Release-Verzeichnisses. Diese Datei enthält keinen Installationstoken, markiert den Abschluss dauerhaft und sperrt den Installer schon vor einer weiteren Tokenprüfung. Der Shell-Installer bleibt als Alternative verfügbar.

Eine Fahrschule wird anschließend über einen vom Plattform-Owner erzeugten Einmal-Link als Tenant provisioniert. Die Transaktion legt Mandant, `tenant_owner`, Mitgliedschaft, Site, Theme, Hauptstandort, Kontaktformular, strukturiertes Rechtsprofil, erste Rechtsentwürfe, Startseite, Navigation, Domain im Status `pending` und Audit-Eintrag an. Der Link ist 14 Tage gültig, wird in der Datenbank nur gehasht gespeichert und nach Verwendung gesperrt. Dafür wird weder das Schema erneut importiert noch eine weitere Anwendungskopie angelegt. Tarif, rechtliche Freigabe und Domainfreigabe bleiben kontrollierte Folgeschritte.
