# ADR 0005: Unveränderliche CMS-Versionen und lokaler Demo-Adapter

- Status: Angenommen
- Datum: 17. September 2026

## Kontext

Öffentliche Seiten dürfen keine halbfertigen Entwürfe zeigen. Gleichzeitig muss die Entwicklung ohne verfügbare lokale MySQL-Instanz prüfbar bleiben.

## Entscheidung

Seiten verweisen auf eine explizite veröffentlichte Version. Blöcke liegen versioniert unter dieser Version und werden durch eine diskriminierte, versionsgebundene Schema-Union validiert. Wiederherstellung erzeugt einen neuen Entwurf. Die öffentliche Abfrage beschränkt Seite, Version, Blöcke und SEO konsequent auf denselben Tenant.

Die Demo verwendet standardmäßig einen Fixture-Adapter mit denselben validierten Domänentypen. Externe Kundendomains greifen ausschließlich auf das Datenbank-Repository zu. Der Adapter ist durch `DEMO_DATA_MODE` sichtbar konfiguriert und keine produktive Datenquelle.

## Folgen

- Entwurf und Veröffentlichung sind klar getrennt.
- Historische Veröffentlichungen bleiben nachvollziehbar.
- Schemaänderungen benötigen Blockmigrationen oder kompatible Renderer.
- Die Transaktions- und Cache-Adapter werden mit dem visuellen Builder ergänzt.
- Die Datenbankabnahme bleibt erforderlich, sobald eine lokale oder Staging-Datenbank verfügbar ist.
