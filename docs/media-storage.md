# Medienverwaltung und Speicher

Stand: 17. September 2026.

## Sicherheitsgrenzen

Medien gehören immer zu genau einem Tenant. Auswahl, Verwendung, Archivierung und spätere Auslieferung erhalten den Tenant ausschließlich aus dem serverseitig geprüften Kontext. Ein übermitteltes `media_id` reicht niemals als Berechtigung. Das Datenmodell hält Verwendungen separat fest, damit verwendete Bilder nur nach einer ausdrücklichen Warnung archiviert werden.

Der Upload akzeptiert höchstens 8 MB große PNG-, JPEG- und WebP-Dateien. Die Prüfung verwendet die tatsächliche Dateisignatur und liest Bildabmessungen serverseitig; Dateiendung und Browser-MIME gelten nicht als Nachweis. Maximal 12.000 × 12.000 Pixel sind erlaubt. SVG, HTML und andere ausführbare Formate sind ausgeschlossen.

Originalnamen werden nur als Metadatum gespeichert. Der Speicherpfad besteht aus technischer Tenant-ID, zufälliger UUID und geprüfter Erweiterung. Namen, E-Mail-Adressen oder andere vertrauliche Werte gelangen nicht in Pfade. Alt-Text ist Pflichtfeld des Datenmodells, darf für dekorative Bilder aber bewusst leer sein.

## Storage-Adapter

Die Fachlogik verwendet ausschließlich das Interface `MediaStorage`. `LocalMediaStorage` schreibt atomar mit restriktiven Dateirechten in `.local-storage/`, das vom Repository ausgeschlossen ist. Pfad-Traversal wird vor jedem Zugriff abgewiesen. Ein späterer S3-kompatibler Adapter kann dieselbe Schnittstelle implementieren, ohne Uploadvalidierung, Tenantprüfung oder Fachmodelle zu ändern.

Eine produktive öffentliche Auslieferungsroute, Variantenberechnung und CDN-Anbindung werden erst nach Hostingnachweis festgelegt. Next.js kann responsive Bildvarianten erzeugen, sobald diese Route eine tenantgeprüfte Quell-URL bereitstellt. Der Bildblock speichert dafür bereits `mediaId` und Alt-Text.

## Ersetzen und Archivieren

Ersetzen legt ein neues Medienobjekt an und aktualisiert die jeweilige Verwendung transaktional. Die alte Datei bleibt bis zur erfolgreichen Referenzänderung erhalten. Archivierung versteckt ein Medium aus der Auswahl. Eine physische Löschung ist kein normaler Nutzerablauf und benötigt später definierte Aufbewahrungsregeln.

## Manuelle Prüfung

1. Eine echte lokale Testgrafik unter 8 MB hochladen, sobald die Kundenoberfläche aus Phase 11 verfügbar ist.
2. Eine umbenannte Textdatei als PNG versuchen; sie muss abgewiesen werden.
3. Mit zwei Test-Tenants versuchen, eine fremde Medien-ID auszuwählen; die Antwort muss „nicht gefunden“ lauten.
4. Ein verwendetes Medium archivieren; vor Bestätigung muss die Anzahl der Verwendungen erscheinen.
