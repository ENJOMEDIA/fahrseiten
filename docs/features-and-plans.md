# Tarife und Feature-Flags

Stand: 17. September 2026.

## Auflösung

Features sind zentral über stabile Schlüssel definiert. Die wirksame Reihenfolge lautet Tenant-Override, Planfreigabe, globaler Standard. Es gibt keine im Anwendungscode verteilten Vergleiche von Tarifnamen. Die vier Status sind `unavailable`, `coming_soon`, `beta` und `enabled`.

Nur `beta` und `enabled` erlauben die serverseitige Nutzung. Jede direkte Route oder Serveraktion muss den Featurestatus nach dem geprüften Tenant-Kontext laden und `requireFeature` aufrufen. Das Verstecken eines Navigationseintrags reicht nicht als Zugriffsschutz.

## Verwaltung und Audit

Nur Plattformrollen mit `platform.tenants.manage` dürfen Tenant-Overrides setzen. Jede Änderung benötigt eine Begründung und schreibt in derselben Datenbanktransaktion ein Audit-Ereignis mit Tenant, Akteur, Feature, Status und Begründung. Sales und Support besitzen dieses Recht nicht.

Der Kundenbereich zeigt „Verfügbar“ für aktive und „In Planung“ für kommende Funktionen. Geplante Funktionen besitzen keinen aktiven Öffnen- oder Startbutton. Tarife, Preise und konkrete Featurepakete sind weiterhin eine Geschäftsentscheidung nach OD-13.

## Vorbereitete Schlüssel

Neben `website_builder` sind `lesson_reminders`, `lesson_booking`, `advanced_crm`, `sms`, `whatsapp`, `payments` und `analytics` als `coming_soon` vorbereitet. Diese Einträge enthalten keine Fachlogik und stellen keine Lieferzusage dar.

## Manuelle Prüfung

1. `/kunde/funktionen` öffnen und Status sowie fehlende Aktionsbuttons geplanter Funktionen prüfen.
2. Ein geplantes Feature direkt serverseitig anfordern; der Guard muss den Zugriff abweisen.
3. Als Plattform-Owner ein Feature mit Begründung auf Beta setzen und Audit-Eintrag prüfen.
4. Als Sales und Support denselben Vorgang versuchen; beide müssen abgewiesen werden.
5. Tenant-Override entfernen und prüfen, dass wieder der Plan- beziehungsweise Standardstatus gilt.
