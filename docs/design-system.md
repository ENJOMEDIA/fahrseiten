# Designsystem

Stand: Phase 6. Die interne Übersicht ist lokal unter `/designsystem` erreichbar.

## Richtung

FahrSeiten verwendet ruhige helle Flächen, dunkle Navigationsbereiche und Cyan/Türkis als funktionale Akzentfarbe. Das System soll professionell, verständlich und eigenständig wirken. Aktuelle Farben, Systemschriften und Texte sind reversible technische Grundlagen; endgültige Markenassets bleiben offen.

Globale Tokens definieren Farben, Typografie, Abstände, Kontroll- und Kartenradien, Schatten sowie Bewegungsdauer. `prefers-reduced-motion` reduziert Animationen und Übergänge. Fokuszustände sind deutlich sichtbar und Informationen werden nicht ausschließlich über Farbe vermittelt.

## Komponenten

- Buttons in primärer, sekundärer, ruhiger und gefährlicher Variante.
- Beschriftete Inputs, Selects und Checkboxen mit Hinweisen und Fehlerzuordnung.
- Karten, Status-Badges, Tabellen, leere Zustände, Skeletons und Toasts.
- Nativer modaler Dialog mit Tastatur- und Fokusverhalten des Browsers.
- Marketing-Navigation, responsive App-Shell, Sidebar, mobile Navigation und Breadcrumbs.

Die Komponenten verwenden semantische Elemente, erreichbare Mindesthöhen und zentrale Varianten. Fachmodule sollen keine abweichenden Grundbuttons oder Formularfelder neu erfinden.

## Anwendungslayouts

- Marketing: öffentlicher Header und breite Inhaltsflächen.
- Plattform-Admin: dunkle Sidebar, kontextbezogener Header und Arbeitsfläche.
- Kunden-Admin: dieselbe Shell mit mandantenspezifischer Navigation.
- Tenant-Website: eigene öffentliche Inhaltsrenderer auf gemeinsamen Tokens.
- Authentifizierung: fokussierte, schmale Formulare ohne Ablenkung.

## Manuelle Prüfung

1. `/designsystem` bei 375 px, 768 px und Desktopbreite öffnen.
2. Alle Aktionen per Tabulatortaste erreichen und den Fokus prüfen.
3. Dialog öffnen, mit Escape schließen und erneut öffnen.
4. Formularlabels und Fehlermeldungen mit Browser-Accessibility-Tree prüfen.
5. Betriebssystemoption „Bewegung reduzieren“ aktivieren und Animationen kontrollieren.
