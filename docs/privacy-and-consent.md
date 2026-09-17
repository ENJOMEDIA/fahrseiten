# Datenschutz- und Consent-Grundlage

Stand: 17. September 2026.

## Technisches Modell

Plattformtexte und mandanteneigene Pflichttexte liegen getrennt und versioniert in `legal_documents`. Ein Entwurf wird nicht automatisch veröffentlicht. Pflichtbereichsprüfungen und eine ausdrückliche Veröffentlichungswarnung unterstützen die Redaktion, ersetzen aber keine rechtliche Prüfung.

Die Consent-Steuerung kennt notwendig, funktional, Statistik und Marketing. Notwendig ist immer aktiv. Ohne gültiges Cookie der aktuellen Hinweisversion `consent-v1` liefert `mayLoadOptional` für jede optionale Kategorie `false`. `OptionalContent` rendert deshalb zunächst nur einen lokalen Platzhalter und löst keinen externen Request aus. Aktuell ist kein optionaler externer Anbieter konfiguriert.

Der Browser speichert die Auswahl für höchstens 180 Tage. Änderungen am Versionsschlüssel machen alte Auswahlwerte ungültig. Auswahl und Widerruf sind auf der Seite Cookie-Einstellungen erneut erreichbar. Der API-Nachweis speichert einen SHA-256-Hash einer zufälligen Browserkennung, Hinweisversion, Kategorien, Host und Zeitpunkte; rohe IP-Adresse, User-Agent und Browserkennung werden nicht gespeichert.

## Vorbereitete Prozesse

`privacy_requests` bildet Export- und Löschanforderungen mit Status und nur gehashter Anfordereradresse ab. `retention_policies` hält später je Datenkategorie festzulegende Aufbewahrungswerte. `subprocessors` macht die Liste eingesetzter Unterauftragnehmer konfigurierbar. Es sind noch keine geschäftlich oder rechtlich verbindlichen Fristen, Anbieter oder Rechtsgrundlagen hinterlegt.

## Grenzen und manuelle Prüfung

- MySQL war lokal nicht verfügbar; Migration und Repository müssen vor Staging gegen eine Testdatenbank geprüft werden.
- Die lokale Rechtstextbearbeitung speichert bewusst nur einen UI-Entwurf und veröffentlicht nichts.
- Tenant-Auflösung für Consent-Nachweise wird vor Einsatz auf externen Kundendomains mit dem geprüften Serverkontext verbunden.
- Cookie ablehnen, selektiv zustimmen, erneut öffnen und widerrufen; dabei prüfen, dass der optionale Beispielinhalt nur bei funktionaler Freigabe erscheint.
- Rechtstext-Warnungen mit fehlenden Pflichtbereichen prüfen und sicherstellen, dass keine produktiven Platzhalter veröffentlicht werden.
