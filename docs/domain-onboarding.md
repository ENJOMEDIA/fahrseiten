# Domain- und SSL-Onboarding

Stand: Phase 5. Dies ist ein technischer Ablaufentwurf; es wurden keine DNS-, SSL- oder Hostingänderungen vorgenommen.

## Auflösung

Der Server normalisiert den tatsächlichen Hostnamen, trennt Marketing-, App- und Demo-Kontext und sucht externe Kundendomains ausschließlich als aktive, global eindeutige Datenbankzuordnung. Unbekannte, deaktivierte oder einem deaktivierten Mandanten zugeordnete Domains liefern keine fremden Inhalte. `X-Forwarded-Host` wird nur berücksichtigt, wenn `TRUST_PROXY_HEADERS=true` für eine nachweislich kontrollierte Proxy-Kette gesetzt ist.

Lokale Standardhosts sind `localhost` und `127.0.0.1` für Marketing, `app.localhost` für die Verwaltung und `demo.localhost` beziehungsweise `demo.fahrseiten.local` für die fiktive Demo. Zusätzliche Hosts werden kommasepariert über die Umgebung konfiguriert.

## Manueller Onboardingablauf

1. Hostname normalisieren und auf bestehende Zuordnungen prüfen.
2. Domain mit Status `pending` anlegen und ein zufälliges Verifikationstoken erzeugen; nur dessen Hash wird dauerhaft gespeichert.
3. Dem Betreiber den erwarteten TXT-Eintrag anzeigen. Bestehende MX-, SPF-, DKIM- und DMARC-Einträge nicht verändern.
4. DNS-Nachweis aus einer vertrauenswürdigen serverseitigen Abfrage prüfen und Status auf `verified` setzen.
5. Routingziel für Apex und/oder `www` passend zum bestätigten Hosting dokumentieren.
6. Nach erfolgreichem Routing ein gültiges TLS-Zertifikat prüfen. DNS-Besitznachweis und SSL sind getrennte Prüfungen.
7. Primärdomain und optionale Weiterleitung eindeutig festlegen, anschließend kontrolliert auf `active` setzen.
8. Fehler als `error`, stillgelegte Domains als `disabled` behandeln. Niemals auf einen Standardmandanten zurückfallen.

Die konkreten DNS-Ziele, Zertifikatsautomatisierung, Proxy-Header und Domainlimits des Plesk-Zielsystems bleiben bis zur kontrollierten Stagingprüfung unbestätigt. Automatische Domainregistrierung und automatisches Provisioning gehören nicht zum MVP.
