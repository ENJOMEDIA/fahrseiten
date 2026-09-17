# ADR 0003: Authentifizierung und Sitzungen

- Status: angenommen
- Datum: 17. September 2026
- Betrifft: Phase 4, OD-05

## Entscheidung

FahrSeiten verwendet eine eigene kleine, datenbankgestützte Authentifizierungsschicht. Passwörter werden mit dem in Node.js 22 enthaltenen `scrypt` gehasht. Zufällige opake Session- und Reset-Tokens werden nur gehasht gespeichert. Autorisierung basiert auf zentralen Plattform- und Mandantenberechtigungen; ein Benutzer darf mehrere aktive Mitgliedschaften besitzen.

## Gründe

Die benötigten Abläufe sind überschaubar und müssen auf einem normalen Node.js-Server ohne externen Identitätsdienst funktionieren. Node-Crypto reduziert native Zusatzabhängigkeiten. Datenbanksitzungen erlauben Widerruf, Audit und einen späteren VPS-Umzug ohne Neuentwicklung.

## Folgen und Grenzen

Cookie-, Token- und Ablaufregeln liegen vollständig im Projekt und müssen sicherheitsgeprüft werden. Plattform-2FA ist noch nicht implementiert. Der lokale Login-Limiter ist pro Prozess; eine persistente Tabelle ist vorbereitet. Passwort-Reset wird erst mit Phase 14 tatsächlich zugestellt.

## Rücknahme

Ein späterer Wechsel auf eine gepflegte Auth-Bibliothek ist möglich, wenn deren Next.js-, MySQL- und Shared-Hosting-Kompatibilität nachgewiesen ist. Bestehende Passwort-Hashes benötigen dabei eine kontrollierte Migration oder Rehash-on-login.
