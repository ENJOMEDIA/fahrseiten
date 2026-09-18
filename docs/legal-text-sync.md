# Rechtstexte mit eRecht24 synchronisieren

Stand: 18. September 2026.

Eine eRecht24-Anbindung ist für FahrSeiten sinnvoll, weil Impressum und
Datenschutzerklärung dann aus einem gepflegten Rechtstextprojekt übernommen und
bei Aktualisierungen synchronisiert werden können. Die aktuelle API v2 liefert
Impressum, Datenschutzerklärung und Social-Media-Datenschutztexte. Sie ersetzt
nicht die technische Prüfung, ob die tatsächlich aktiven FahrSeiten-Module,
Cookies und Empfänger mit den Angaben im eRecht24-Projekt übereinstimmen.

Für eine eigene FahrSeiten-Integration verlangt eRecht24 neben dem API-Key des
Projekts einen verifizierten Developer-Key und die Zustimmung zu besonderen
API-Bedingungen. Dieser Developer-Key muss vor der Implementierung über
`api@e-recht24.de` beantragt werden. Registrierte Clients erhalten zusätzlich
eine `client_id` und ein Secret zur Prüfung von Push-Benachrichtigungen.

Für die mandantenfähige Plattform ist folgende Trennung vorgesehen:

- Der Developer-Key gehört FahrSeiten und liegt ausschließlich als geschützte
  Plesk-Umgebungsvariable vor.
- API-Key, Client-ID und Client-Secret gehören zum jeweiligen
  eRecht24-Kundenprojekt. Sie dürfen erst nach Aufbau einer verschlüsselten
  Mandantenablage gespeichert werden und müssen serverseitig an `tenant_id`
  gebunden sein.
- Push-Nachrichten werden anhand des Client-Secrets geprüft, versioniert als
  neuer Entwurf gespeichert und nie ungeprüft veröffentlicht.
- Vor Veröffentlichung zeigt FahrSeiten den Diff und verlangt eine bewusste
  Freigabe. So überschreibt eine externe Änderung keine kundenspezifischen
  Angaben stillschweigend.
- Ein täglicher Abgleich kann später als Ausfallsicherung dienen. Vorrangig ist
  der von eRecht24 vorgesehene Push-Mechanismus; derzeit wird dafür noch kein
  Cronjob angelegt.

Vor der technischen Aktivierung sind Tarif, zulässige Anzahl der Kundenprojekte,
Abmahnschutzbedingungen, API-Bedingungen, AVV, Änderungsrechte an gelieferten
Texten und der Umgang mit gekündigten eRecht24-Projekten zu klären. Zugangsdaten
werden erst danach in Plesk beziehungsweise der verschlüsselten Mandantenablage
hinterlegt.

Quelle: [eRecht24 API v2](https://api-docs.e-recht24.de/)
