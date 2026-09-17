# ADR 0004: Domain- und Hostauflösung

- Status: angenommen
- Datum: 17. September 2026
- Betrifft: Phase 5, OD-06

## Entscheidung

Plattformhosts werden vor dem öffentlichen Tenant-Rendering explizit klassifiziert. Externe Hosts werden normalisiert und serverseitig gegen eine aktive Domain- und Mandantenzuordnung geprüft. Ein Next.js-Proxy schreibt öffentliche Domainpfade intern auf den Tenant-Renderer um; die Datenbankauflösung und Berechtigungsgrenze bleiben im Servermodul.

Weitergeleitete Host-Header sind standardmäßig nicht vertrauenswürdig. Sie werden nur nach expliziter Konfiguration einer kontrollierten Proxy-Kette verwendet. Unicode-Domains werden über IDNA in ASCII/Punycode normalisiert.

## Folgen

Unbekannte oder deaktivierte Hosts erhalten eine sichere Nicht-gefunden-Antwort. Es gibt keinen Fallback-Tenant. Vorschauzugriff und endgültige Proxy-/SSL-Konfiguration werden mit den tatsächlichen Hostingbedingungen weiter geprüft.
