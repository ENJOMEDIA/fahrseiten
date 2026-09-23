# Tarife und Feature-Flags

Stand: 23. September 2026.

## Auflösung

Features sind zentral über stabile Schlüssel definiert. Die wirksame Reihenfolge lautet Tenant-Override, Planfreigabe, globaler Standard. Paketleistungen sind global standardmäßig gesperrt und werden durch die aktive Subscription oder einen protokollierten Tenant-Override freigeschaltet. Es gibt keine im Anwendungscode verteilten Vergleiche von Tarifnamen. Die vier Status sind `unavailable`, `coming_soon`, `beta` und `enabled`.

Nur `beta` und `enabled` erlauben die serverseitige Nutzung. Jede direkte Route oder Serveraktion muss den Featurestatus nach dem geprüften Tenant-Kontext laden und `requireFeature` aufrufen. Das Verstecken eines Navigationseintrags reicht nicht als Zugriffsschutz.

## Verwaltung und Audit

Nur Plattformrollen mit `platform.tenants.manage` dürfen Tenant-Overrides setzen. Jede Änderung benötigt eine Begründung und schreibt in derselben Datenbanktransaktion ein Audit-Ereignis mit Tenant, Akteur, Feature, Status und Begründung. Sales und Support besitzen dieses Recht nicht.

Der Kundenbereich zeigt „In deinem Paket“ für aktive, „Nicht im Paket“ für zubuchbare und „In Planung“ für kommende Funktionen. Geplante Funktionen besitzen keinen aktiven Öffnen- oder Startbutton. Tarife und Preise bleiben eine Geschäftsentscheidung. Die konkrete Zuordnung wird in der Plattformverwaltung gepflegt und beim Abschluss einer Instanzeinrichtung als Subscription mit Preis-Snapshot gespeichert.

## Technisch durchgesetzte Paketgrenzen

- Alle Pakete: öffentliche Website, Website-Builder, strukturierte Fahrschulinhalte, eigene Domain, Recht & Consent sowie Wartungsseite.
- Medien-Grundausstattung: Logo, Favicon und notwendige Seitenbilder stehen in allen Paketen bereit.
- Wachstum und Pole Position: drei Designvorlagen sowie die erweiterte Medienverwaltung mit Kategorien und Bildzuschnitt.
- Pole Position: mehrere Standorte und im Support-Dashboard priorisierte Fehlermeldungen.

Ein Hauptstandort ist immer enthalten. Ohne das Modul `multi_location` wird das Anlegen eines zweiten Standorts auch serverseitig abgewiesen. Direkte Requests an Builder, Inhalte, Recht, Domain und Wartung prüfen die jeweilige Freischaltung zusätzlich zur Navigation.

Bei jeder neuen Instanzeinladung ist ein aktives Paket Pflicht. Ältere, bereits ausgestellte Einrichtungslinks ohne Paketauswahl erhalten beim Abschluss aus Kompatibilitätsgründen das erste aktive Paket nach der konfigurierten Reihenfolge.

Die Paketverwaltung bietet Monatszahlung und optional Jahreszahlung. Der
Jahresrabatt ist je Paket konfigurierbar; die Oberfläche zeigt den tatsächlichen
Jahresbetrag und die Ersparnis. Zahlungsintervall und Mindestvertragslaufzeit
sind getrennte Angaben. Der aktuell vorbelegte Rabatt von zehn Prozent ist eine
änderbare Produkteinstellung und keine rechtliche oder steuerliche Vorgabe.

## Vorbereitete Schlüssel

Der `website_builder` ist als Kernfunktion verfügbar und in allen drei Paketen enthalten. `lesson_reminders`, `lesson_booking`, `advanced_crm`, `sms`, `whatsapp`, `payments` und `analytics` sind als `coming_soon` vorbereitet. Diese geplanten Einträge enthalten noch keine vollständige Fachlogik und stellen keine Lieferzusage dar.

## Manuelle Prüfung

1. `/kunde/funktionen` öffnen und Status sowie fehlende Aktionsbuttons geplanter Funktionen prüfen.
2. Ein geplantes Feature direkt serverseitig anfordern; der Guard muss den Zugriff abweisen.
3. Als Plattform-Owner ein Feature mit Begründung auf Beta setzen und Audit-Eintrag prüfen.
4. Als Sales und Support denselben Vorgang versuchen; beide müssen abgewiesen werden.
5. Tenant-Override entfernen und prüfen, dass wieder der Plan- beziehungsweise Standardstatus gilt.
