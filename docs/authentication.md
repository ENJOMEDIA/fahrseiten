# Authentifizierung und Autorisierung

Stand: Phase 4. Anmeldung, Abmeldung, Passwort-Reset-Grundlage, Datenbanksitzungen und zentrale Rollenprüfung sind implementiert.

## Sicherheitsmodell

- Passwörter werden mit Node.js `scrypt` und zufälligem 128-Bit-Salt abgeleitet. Der gespeicherte Wert enthält Algorithmusparameter, Salt und Hash, niemals das Passwort.
- Session- und Reset-Tokens enthalten 256 Bit Zufall. In der Datenbank steht ausschließlich ein SHA-256-Hash des Tokens.
- Sitzungen laufen nach zwölf Stunden ab. Cookies sind `HttpOnly`, `SameSite=Lax`, pfadgebunden und in Produktion `Secure` mit `__Host-`-Präfix.
- Passwort-Reset-Tokens laufen nach 30 Minuten ab, sind einmalig und widerrufen bei Verwendung sämtliche Sitzungen des Benutzers.
- Loginfehler verwenden eine identische Meldung für unbekannte Konten und falsche Passwörter. Ein lokaler Rate-Limiter blockiert wiederholte Versuche; die Datenbanktabelle für eine persistente Umsetzung ist vorbereitet.
- Login, Logout und abgeschlossene Passwortänderungen erzeugen Audit-Ereignisse ohne Klartext-Tokens oder Formulardaten.

Server Actions übernehmen die Mutation und Next.js prüft ihre Herkunft. Direkte Datenbankfunktionen liegen in serverseitig markierten Modulen. UI-Ausblendung ersetzt keine Rechteprüfung.

## Rollen und Tenant-Auswahl

Plattform- und Mandantenberechtigungen sind getrennte, zentrale Zuordnungen in `src/modules/auth/permissions.ts`. Der Kundenbereich akzeptiert ausschließlich Benutzer mit mindestens einer aktiven Mitgliedschaft. Eine aktive `tenant_id` darf später nur aus diesen serverseitig geladenen Mitgliedschaften gewählt werden.

Die Matrix setzt für das MVP folgende reversible Standardgrenzen: `tenant_owner` besitzt alle definierten Mandantenrechte, `tenant_editor` darf Inhalte lesen, bearbeiten und veröffentlichen, `tenant_viewer` nur Inhalte lesen. Zugriff auf personenbezogene Anfragen bleibt zunächst beim `tenant_owner`, bis ENJO MEDIA weitere Rechte freigibt.

## Lokale Demo-Zugänge

Nach erfolgreichem `pnpm db:migrate && pnpm db:seed` stehen ausschließlich lokal zur Verfügung:

- Plattform: `plattform@fahrseiten.local`
- Mandant: `inhaber@morgenrot.local`
- Passwort für beide lokale Konten: `Demo-FahrSeiten-2026!`

Diese Werte sind ausdrücklich fiktive lokale Demo-Zugangsdaten. Sie dürfen in keiner öffentlich erreichbaren Umgebung verwendet werden.

## Passwort-Reset-Einschränkung

Anforderung und Einlösung sind implementiert. Die sichere Zustellung des Klartext-Tokens wird erst in Phase 14 an die Notification-Schnittstelle angeschlossen. Tokens werden deshalb weder geloggt noch in der Oberfläche angezeigt. Bis dahin ist der Ablauf nur auf Service-/Datenbankebene prüfbar.

## Noch offen

Zwei-Faktor-Authentifizierung für Plattform-Admins wird vor Produktivstart ergänzt; Zeitpunkt und Methode bleiben in OD-05 offen. Der lokale speicherbasierte Login-Limiter muss vor Mehrprozessbetrieb durch den vorbereiteten persistenten Adapter ersetzt werden. Echte E-Mail-Zustellung folgt Phase 14.
