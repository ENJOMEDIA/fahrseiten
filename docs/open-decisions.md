# Offene Entscheidungen

Stand: 17. September 2026. Hier stehen nicht abschließend entschiedene Punkte aus Schritt 1. Ein Eintrag ist keine Freigabe und keine getroffene Geschäftsentscheidung. Technische Vorschläge werden vor Einführung geprüft und gegebenenfalls als [ADR](decisions/README.md) dokumentiert. Geschäftsentscheidungen werden durch ENJO MEDIA freigegeben.

## Dokumentationsabweichungen

| ID | Befund | Aktuelle Behandlung | Klärungszeitpunkt |
| --- | --- | --- | --- |
| OD-01 | AGENTS.md verlangt selbstständige lokale Commits ohne Push; Masterprompt Abschnitt 14 und Freigabeprompt verlangen Freigabe vor Commit und danach Push | Der ausdrückliche Auftrag für Schritt 1 autorisiert den lokalen Commit und verbietet Push. Die Branch-Regel bleibt anwendbar: phase/01-produktspezifikation, kein eigenständiger Merge. Ältere Quelldokumente werden in diesem Auftrag nicht geändert | Vor späterer Vereinheitlichung der Arbeitsgrundlagen; für diesen Auftrag geklärt |
| OD-02 | AGENTS.md verbietet pauschal .env-Dateien; Laufplan, Masterprompt und .gitignore sehen eine .env.example mit Platzhaltern vor | Noch keine Umgebungsdatei anlegen; die reine Platzhalter-Ausnahme muss ausdrücklich konsistent dokumentiert werden | Vor Anlegen der Datei in Schritt 2 |
| OD-09 | Schritt 4 benötigt Reset-Nachrichten; Schritt 12 verlangt eine Benachrichtigung, obwohl die Job-/Notification-Grundlage erst Schritt 14 folgt. Schritt 11 nennt bereits sämtliche Kundenaufgaben, obwohl Anfragen und Consent später folgen | Abhängigkeiten sichtbar halten, keine vollständigen späteren Funktionen vorziehen und keine vorzeitige Abnahme behaupten. Frühe Schnittstellen/Testadapter und die Grenzen der jeweiligen Zwischenabnahme noch abstimmen | Vor Schritt 4, erneut vor Schritt 11/12 |

## Technische Entscheidungen

| ID | Offene Entscheidung und benötigter Nachweis | Spätestens relevant |
| --- | --- | --- |
| OD-03 | Node.js-/Next.js-/React-/Tailwind-/Drizzle-Versionen, Paketmanager, Validierungsbibliothek, Projektstruktur, Testwerkzeuge und CI; aktuelle offizielle Dokumentation und gegenseitige Kompatibilität prüfen, Hostingziel berücksichtigen | Schritt 2, Drizzle vor Schritt 3 |
| OD-04 | MySQL oder MariaDB, Version, lokaler Betrieb, ID-Strategie, Schema/Indizes, Transaktionsgrenzen sowie Migrations- und Seedverfahren | Schritt 3 |
| OD-05 | Authentifizierungsbibliothek, Session-/Cookie-Konzept, Hashing, Reset-/Einladungsablauf, Rate-Limit-Speicher; Zeitpunkt und Verfahren der Zwei-Faktor-Authentifizierung mindestens für Plattform-Admins | Schritt 4; 2FA-Zeitpunkt dort dokumentieren |
| OD-06 | Vertrauenswürdige Proxy-/Host-Header, lokale Domainstrategie, Vorschauzugriff, Domain-Statusübergänge, DNS-Ziele, Verifikationsverfahren, SSL und Domainlimits beim tatsächlichen Hosting | Lokales Modell Schritt 5; Infrastrukturprüfung vor Staging |
| OD-07 | CMS-Schemaversionierung, konkurrierende Bearbeitung, atomare Veröffentlichung, Wiederherstellung und tenantgebundene Cache-Invalidierung | Schritt 7, Builderdetails Schritt 10 |
| OD-08 | SMTP-Anbieter/Testbetrieb, Absender, Jobpersistenz, Cron-Absicherung, Sperren, Retry-Grenzen, Idempotenz bei Abstürzen und Zustellstatus | Frühe Schnittstellen vor Schritt 4/12; vollständig Schritt 14 |
| OD-14 | Hostingressourcen und Startmechanismus, Deployment/Restart/Rollback, Storagepfade und spätere S3-Option, Monitoring, Backupziel, Verschlüsselung/Schlüssel, Aufbewahrung, Wiederherstellungszeit und tolerierbarer Datenverlust | Speicher Schritt 9, Monitoring Schritt 18; Betriebsnachweis und Restore vor Produktivstart |

## Produkt-, Rechte- und Betriebsentscheidungen

| ID | Offene Entscheidung | Zuständigkeit und Zeitpunkt |
| --- | --- | --- |
| OD-10 | Markenassets, konkrete Farben/Schriften, Anzahl und Varianten der Designs, endgültige Marketingtexte und Demo-Inhalte | ENJO MEDIA vor Schritt 6/10/16; keine erfundenen Referenzen |
| OD-11 | Aktionsrechte je Rolle: Veröffentlichung, Rechtstexte, Kontakte, Export/Löschung, Einladungen, Eigentumswechsel, Domainaktivierung, Tarif-/Featureänderungen und Supportfreigabe | ENJO MEDIA vor jeweiliger Rechteimplementierung, Grundmatrix vor Schritt 4 |
| OD-12 | Rechtstexte, Verantwortlichkeiten, AV-Verträge, Unterauftragnehmer, Aufbewahrungs-/Löschregeln, Exportumfang, Consent-Nachweis und Behandlung gelöschter Daten in Backups | ENJO MEDIA mit erforderlicher rechtlicher Prüfung; Datenmodell früh berücksichtigen, vor Produktivstart verbindlich klären |
| OD-13 | Tarife, Einrichtungs-/Monatspreise, Limits für Benutzer/Seiten/Speicher/Domains, Featurezuordnung, Vertrags-/Kündigungs-/Übergabeprozess, Währung/Steuerdarstellung und Zeitzonenregeln | ENJO MEDIA; fachliche Datenregeln vor Schritt 8, Tarife vor Schritt 15/16 |
| OD-15 | Konkretes Barrierefreiheitsziel, messbare Performanceziele, unterstützte Browser/Geräte und verbindliche Qualitätsbudgets | ENJO MEDIA und technische Bewertung vor Designsystem, vor Freigabe überprüfen |
| OD-16 | Staging-Testdomains, Verantwortliche für DNS/SSL und Betriebsfreigabe, Pilotmandant, Supportabläufe und Umgang mit Pilotfeedback | ENJO MEDIA vor Schritt 20/21; keine echte Datenverwendung oder externe Änderung ohne Auftrag |

## Bereits festgelegter Rahmen

Zentrale Codebasis, modularer Monolith, Next.js App Router, React, TypeScript Strict Mode, Tailwind und eigenes Designsystem, MySQL/MariaDB mit Drizzle, serverseitige Tenant-Isolation, kontrollierter Block-Builder, SMTP, Cron und das Hostingziel mit späterer VPS-Migration sind vorgegeben. Versions- und Betriebsdetails sind damit noch nicht entschieden.

Die MVP-Grenze steht im [Product Scope](product-scope.md). Insbesondere Fahrstundenplanung, Schülerverwaltung, automatische Fahrstundenerinnerungen, SMS/WhatsApp, Zahlungen, automatische Domainregistrierung, vollständiges Self-Service-Onboarding und umfangreiche Analytics bleiben außerhalb des ersten MVP. Priorität, Termine und konkrete Anbieter späterer Erweiterungen sind nicht festgelegt; sie werden erst in eigenen Aufträgen entschieden.

## Umgang mit Entscheidungen

Zu jedem geklärten Eintrag werden Datum, Entscheidung, Freigabe beziehungsweise Nachweis und gegebenenfalls ADR-Verweis ergänzt. Offene Fragen dürfen nicht als implementierte oder freigegebene Funktionen dargestellt werden. Neue echte Blocker werden gemeldet; die aktuelle Dokumentationsarbeit kann ohne technische Versionswahl oder geschäftliche Annahmen abgeschlossen werden.
