# Vertriebswebsite und redaktionelle Platzhalter

Stand: 17. September 2026.

## Seiten und Positionierung

Die Vertriebswebsite umfasst Startseite, Funktionen, Design und Demo, Preise, FAQ, Beratung, Login, Impressum, Datenschutz, Cookie-Einstellungen und Fehler melden. Sie positioniert FahrSeiten als zentrale, mandantenfähige Website-Plattform für Fahrschulen ohne WordPress oder getrennte Kundeninstallationen.

Verfügbare MVP-Funktionen und spätere Erweiterungen werden getrennt dargestellt. Es gibt keine erfundenen Kundenstimmen, Referenzen, Reichweiten oder Conversion-Zahlen. Die verlinkte Fahrschuldemo bezeichnet alle Namen, Personen, Preise und Kontaktdaten als fiktiv.

Preisinformationen stammen ausschließlich aus `src/config/marketing.ts`. Solange OD-13 offen ist, steht dort `price: null` und die Website zeigt „Preis wird festgelegt“. Geplante Angebote besitzen keinen Buchungsbutton.

Beratungsanfragen gehen über `/api/sales-lead` in das Plattform-Akquise-CRM und nie in einen Kundenmandanten. Serverseitige Validierung, Honeypot, Zeitprüfung und Drosselung gelten auch hier. Im lokalen Fixture-Modus bleiben die Daten im Prozessspeicher; im Datenbankmodus werden Lead, Nachricht und Version des bestätigten vorläufigen Datenschutzhinweises nachvollziehbar gespeichert.

## Redaktionell offen

- Verbindliche Markenassets und freigegebene Schriften.
- Endgültige Nutzen-, Leistungs- und Beratungstexte.
- Einrichtungs- und Monatspreise, Steuerdarstellung, Tarifnamen und Limits.
- Vollständiges Impressum mit Unternehmens- und Registerangaben.
- Rechtlich geprüfte Datenschutzerklärung samt Hosting, SMTP und Unterauftragnehmern.
- Verbindliche Kontaktdaten und Empfänger der Beratungsanfragen.
- Open-Graph-Bild und freigegebene Social-Media-Darstellung.

Die aktuellen Rechteseiten kennzeichnen sich sichtbar als Entwurf beziehungsweise Platzhalter und dürfen so nicht produktiv veröffentlicht werden.

## SEO und Navigation

Globale Metadaten, Open Graph, semantische Überschriften, `sitemap.xml` und `robots.txt` sind vorhanden. Admin, Kundenbereich, APIs, Builder-Demo und Fahrschuldemo werden in `robots.txt` ausgeschlossen. Vor Produktivstart müssen Domain, Canonicals und OG-Bild in einer Stagingumgebung geprüft werden.

## Manuelle Prüfung

1. Sämtliche Header- und Footerlinks auf Desktop und Mobilgerät mit Tastatur öffnen.
2. Funktionen und Preise auf klare Trennung von verfügbar und geplant prüfen.
3. Demo, Login, Beratung und Fehlerseite öffnen; keine Sackgassen zulassen.
4. Eine fiktive Beratungsanfrage senden und ausschließlich im Akquise-CRM suchen.
5. Quelltext, Sitemap und Robots-Ausgabe sowie Seitentitel prüfen.
