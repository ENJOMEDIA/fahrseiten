# Plattformverwaltung und Akquise

Stand: 18. September 2026.

## Rollen und Grenzen

`platform_owner` verwaltet Mandanten, Pläne, Features, Sicherheit, Akquise und Support. `platform_sales` sieht und bearbeitet ausschließlich Akquise, Aktivitäten und Wiedervorlagen. `platform_support` erhält ausschließlich die Diagnosefunktion. Die Navigation wird serverseitig nach Berechtigung erzeugt; jede Route prüft dasselbe Recht erneut.

Sales kann keine Mandanten-, Plan-, Eigentümer- oder Sicherheitseinstellungen ändern. Support kann weder Tarife noch Rollen verändern. Eine Supportansicht verlangt einen konkreten Grund, schreibt ein Audit-Ereignis und bleibt lesend. Es gibt keine technische Kontoübernahme oder verdeckte Kundenidentität.

## Mandantenverwaltung

Mandanten können gesucht, angelegt, bearbeitet und deaktiviert werden. Die Detailansicht bündelt Kundenzugänge, Domains, Plan, Feature-Freigaben, Onboarding-Checkliste, interne Notizen und Aktivität. Interne Notizen dürfen keine Zugangsdaten oder unnötigen sensiblen Angaben enthalten.

Die Detailansicht ist zugleich die [Kundenakte](customer-history.md). Sie führt die feste Lead-ID, eine lesbare Kundennummer und die technische Tenant-ID zusammen. Akquise-Aktivitäten, Onboarding, Systemereignisse und historische Paketzuweisungen werden chronologisch dargestellt. Paketname und Preise werden bei jeder Zuweisung als Snapshot gespeichert, damit spätere Preisänderungen den damaligen Vertragsstand nicht überschreiben.

Ein aus dem Akquise-CRM gestarteter Einrichtungslink speichert die konkrete Lead-ID. Die fertige Instanz wird ausschließlich mit diesem Lead verbunden; eine unsichere Zuordnung über übereinstimmende E-Mail-Adressen findet nicht statt. Wird eine Instanz ohne vorhandenen Lead vorbereitet, legt das System zuerst einen Lead an.

## Akquise-CRM

Leads speichern Fahrschule, Ansprechperson, Kontaktdaten, bestehende Website, Quelle, Verantwortlichen, nächsten Termin und Verlustgrund. Die Pipeline umfasst `new`, `contacted`, `interested`, `demo`, `offer`, `won` und `lost`. Aktivitäten und Aufgaben liegen in getrennten Tabellen.

Ein gewonnener Lead wird innerhalb einer gesperrten Repository-Transaktion in einen Mandanten umgewandelt. Unternehmensname und vorhandene Kontaktdaten werden übernommen. `converted_tenant_id` macht Wiederholungen idempotent und verhindert doppelte Mandanten durch denselben Vorgang. Die konkrete Dublettenprüfung über normalisierte Firmendaten bleibt eine manuelle Fachentscheidung.

### Brief-Rückmeldung

Jeder Kontakt besitzt einen signierten persönlichen Brief-Link und einen als SVG herunterladbaren QR-Code. Die neue Seite `/brief/{leadId}` ist ausschließlich für die postalische Akquise bestimmt und verändert weder die Produktwebsite noch die Beispielwebsite. Sie bietet die Antworten „Interesse“, „weitere Informationen per E-Mail“ und „kein Interesse“ an.

Bei den beiden positiven Antworten wird eine E-Mail-Einwilligung separat erfasst und per Double-Opt-in bestätigt. Erst danach wird die Informationsmail mit Link zur Beispielwebsite geplant. „Kein Interesse“ erzeugt keine Einwilligung, stoppt offene Akquise-Nachrichten und dokumentiert die Sperre. Der genaue Ablauf ist unter [Postalische Akquise](postal-acquisition.md) beschrieben.

Die Versandwarteschlange benötigt den eingerichteten SMTP-Zugang und Cronjob. Ein externer Briefdienst ist noch nicht angebunden.

## Manuelle Prüfung

1. Mit jeder Plattformrolle anmelden und die sichtbare Navigation vergleichen.
2. Als Sales `/admin/mandanten` und als Support `/admin/akquise` direkt aufrufen; beide Zugriffe müssen abgewiesen werden.
3. Einen rein fiktiven Lead durch alle Stufen führen, Aktivitäten und Wiedervorlage erfassen.
4. Einen gewonnenen Lead zweimal umwandeln; beide Aufrufe müssen dieselbe Tenant-ID liefern.
5. Eine Supportansicht ohne ausreichenden Grund öffnen; der Vorgang muss scheitern. Mit Grund muss ein Audit-Eintrag entstehen.
6. Einen Brief-Link und dessen QR-Code mit einem fiktiven Kontakt prüfen; positive Rückmeldung einschließlich Double-Opt-in sowie Ablehnung getrennt testen.
