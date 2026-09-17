# ADR 0006: Plesk-Bereitstellung aus Git als Standalone-Build

- Status: angenommen
- Datum: 17. September 2026
- Betroffener Bereich: Deploymentvorbereitung nach Phase 19
- Offene Entscheidung: OD-14

## Kontext

FahrSeiten soll zunächst auf einem Linux-Plesk-System betrieben werden. Plesk erwartet eine Startdatei direkt im Application Root. Die Anwendung benötigt weiterhin den vollständigen Next.js-Server für dynamische Routen, Authentifizierung, Tenant-Auflösung und API-Endpunkte. Ein statischer Export ist deshalb ungeeignet.

## Entscheidung

Next.js wird mit `output: "standalone"` gebaut. Ein reproduzierbarer Packschritt ergänzt öffentliche und statische Assets, Datenbankmigrationen sowie drei kleine Plesk-Einstiegspunkte für Start, Migration und Scheduler. Die Startdatei validiert produktionskritische Umgebungsvariablen, bevor sie den von Next.js erzeugten Server lädt.

Plesk zieht den Branch `main` im manuellen Deploymentmodus direkt aus GitHub. Eine versionierte zusätzliche Deployment-Aktion baut das Standalone-Verzeichnis auf dem Linux-Zielsystem mit Node.js 22. Der manuell ausgelöste GitHub-Actions-Workflow kann weiterhin ein geprüftes komprimiertes Artefakt bereitstellen, ist aber nur ein Fallback und nimmt kein Deployment vor.

Secrets werden nicht in das Artefakt geschrieben. Plesk stellt allgemeine Laufzeitwerte, SMTP-Zugang und den einmaligen Installationscode als Umgebungsvariablen bereit. Der Browserinstaller erfasst die Zugangsdaten der leeren Datenbank und schreibt die daraus erzeugte Verbindungs-URL atomar mit Dateimodus `0600` in eine persistente Runtime-Datei außerhalb des Release-Verzeichnisses. Die Abschlussmarkierung in derselben Datei verwirft den Installationscode anwendungsseitig. `PORT` und `HOSTNAME` bleiben unter Kontrolle der Hostinglaufzeit.

## Gründe

- Next.js dokumentiert Standalone Output als minimalen, selbst hostbaren Produktionsserver einschließlich nachverfolgter Runtime-Abhängigkeiten.
- Plesk verlangt die Startdatei im Application Root und unterstützt dort benutzerdefinierte Umgebungsvariablen.
- Der erzeugte Server vermeidet einen eigenen Next.js-Custom-Server und behält die Frameworkoptimierungen.
- Der Build bleibt von einer bestimmten Plesk-Verzeichnisstruktur und einem bestimmten Hostinganbieter unabhängig.
- Der direkte Git-Pull entspricht dem vorgesehenen Plesk-Betriebsweg und vermeidet manuelle Datei-Uploads.

## Folgen und Grenzen

- Das Git-Repository liegt im Plesk-Quellverzeichnis; Application Root ist dessen erzeugtes `dist/plesk`, Document Root das darin enthaltene `public`-Unterverzeichnis.
- Native Runtime-Abhängigkeiten erfordern einen Linux-Build passend zur Zielarchitektur.
- Migrationen bleiben ein bewusster Schritt nach einem Datenbankbackup.
- Die persistente Runtime-Datei muss bei Deployments erhalten, in Backups geschützt und bei einer Zugangsdatenrotation kontrolliert aktualisiert werden.
- Reverse Proxy, Host-Header, SSL, Datenbank, persistenter Medienspeicher, Cron-Umgebung und Restart-Verhalten müssen am realen Plesk-System geprüft werden.
- Eine spätere VPS-Migration kann dasselbe Standalone-Artefakt oder einen Container verwenden, ohne die Fachlogik neu zu entwickeln.

## Nachweise

- Next.js 16.3.5, lokale Dokumentation `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/output.md`, geprüft am 17. September 2026
- [Next.js: Self-Hosting](https://nextjs.org/docs/app/guides/self-hosting), geprüft am 17. September 2026
- [Plesk Obsidian: Hosting Node.js Applications](https://docs.plesk.com/en-US/obsidian/administrator-guide/website-management/nodejs-support.76652/), geprüft am 17. September 2026
- Lokale Prüfungen: Produktions-Build, Artefaktstruktur, Runtime-Abhängigkeiten, Konfigurationsvalidierung und HTTP-Startcheck
- [Plesk Obsidian: Using remote Git hosting](https://docs.plesk.com/en-US/obsidian/customer-guide/git-support/using-remote-git-hosting.75848/), geprüft am 17. September 2026

## Rücknahmeweg

`output: "standalone"`, die Plesk-Einstiegspunkte, das Git-Deployskript und der optionale Artefaktworkflow können entfernt werden, ohne Datenmodell oder Fachmodule zu ändern. Ein alternatives Ziel muss weiterhin Node.js 22, Host-basierte Tenant-Auflösung, Umgebungsvariablen, Migrationen, Scheduler und persistenten Speicher bereitstellen.
