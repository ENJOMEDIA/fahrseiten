# Plattformverwaltung und Akquise

Stand: 17. September 2026.

## Rollen und Grenzen

`platform_owner` verwaltet Mandanten, Pläne, Features, Sicherheit, Akquise und Support. `platform_sales` sieht und bearbeitet ausschließlich Akquise, Aktivitäten und Wiedervorlagen. `platform_support` erhält ausschließlich die Diagnosefunktion. Die Navigation wird serverseitig nach Berechtigung erzeugt; jede Route prüft dasselbe Recht erneut.

Sales kann keine Mandanten-, Plan-, Eigentümer- oder Sicherheitseinstellungen ändern. Support kann weder Tarife noch Rollen verändern. Eine Supportansicht verlangt einen konkreten Grund, schreibt ein Audit-Ereignis und bleibt lesend. Es gibt keine technische Kontoübernahme oder verdeckte Kundenidentität.

## Mandantenverwaltung

Mandanten können gesucht, angelegt, bearbeitet und deaktiviert werden. Die Detailansicht bündelt Kundenzugänge, Domains, Plan, Feature-Freigaben, Onboarding-Checkliste, interne Notizen und Aktivität. Interne Notizen dürfen keine Zugangsdaten oder unnötigen sensiblen Angaben enthalten.

## Akquise-CRM

Leads speichern Fahrschule, Ansprechperson, Kontaktdaten, bestehende Website, Quelle, Verantwortlichen, nächsten Termin und Verlustgrund. Die Pipeline umfasst `new`, `contacted`, `interested`, `demo`, `offer`, `won` und `lost`. Aktivitäten und Aufgaben liegen in getrennten Tabellen.

Ein gewonnener Lead wird innerhalb einer gesperrten Repository-Transaktion in einen Mandanten umgewandelt. Unternehmensname und vorhandene Kontaktdaten werden übernommen. `converted_tenant_id` macht Wiederholungen idempotent und verhindert doppelte Mandanten durch denselben Vorgang. Die konkrete Dublettenprüfung über normalisierte Firmendaten bleibt eine manuelle Fachentscheidung.

## Manuelle Prüfung

1. Mit jeder Plattformrolle anmelden und die sichtbare Navigation vergleichen.
2. Als Sales `/admin/mandanten` und als Support `/admin/akquise` direkt aufrufen; beide Zugriffe müssen abgewiesen werden.
3. Einen rein fiktiven Lead durch alle Stufen führen, Aktivitäten und Wiedervorlage erfassen.
4. Einen gewonnenen Lead zweimal umwandeln; beide Aufrufe müssen dieselbe Tenant-ID liefern.
5. Eine Supportansicht ohne ausreichenden Grund öffnen; der Vorgang muss scheitern. Mit Grund muss ein Audit-Eintrag entstehen.
