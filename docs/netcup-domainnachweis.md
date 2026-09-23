# netcup-Domainnachweis für FahrSeiten

Stand: 23. September 2026. Grundlage ist eine schriftliche Auskunft des
netcup-Supports zum Webhosting-8000-Tarif. Der Nachweis bestätigt die
grundsätzlichen Hostingfähigkeiten; die konkrete Konfiguration jeder Domain
muss weiterhin technisch abgenommen werden.

## Bestätigte Punkte

- Mehrere externe Domains können denselben Dokumentenstamm und damit dieselbe
  Node.js-Anwendung verwenden.
- Die aufgerufene Domain wird unverändert übergeben. FahrSeiten kann den
  Mandanten daher anhand des ursprünglichen `Host`-Headers auflösen.
- Für jede externe Domain kann ein eigenes SSL-Zertifikat eingerichtet werden.
- Mehrere Kundenwebsites dürfen grundsätzlich im Webhosting-8000-Tarif
  betrieben werden. netcup übernimmt keine Garantie, dass jede konkrete
  Anwendungskonfiguration ohne weitere technische Prüfung funktioniert.
- Die im Tarif genannte Grenze von zwölf externen Domains betrifft laut
  Support nicht Domains, die bei netcup registriert und dem Webhosting
  zugewiesen sind. Solche Domains sind hinsichtlich ihrer Anzahl nicht durch
  diese externe-Domain-Grenze beschränkt.
- Üblicherweise wird jede Domain einzeln im Webhosting eingerichtet. Für
  FahrSeiten erhält sie dabei denselben Dokumentenstamm beziehungsweise
  Application Root wie `fahrseiten.de`, statt eine eigene Codekopie zu erhalten.

## Konsequenz für FahrSeiten

Die zentrale Mandantenarchitektur bleibt unverändert: eine Anwendung, eine
gemeinsame Datenbank und eine serverseitig geprüfte Domainzuordnung. Eine neue
Kundendomain wird in Plesk einzeln angelegt, demselben FahrSeiten-Root
zugewiesen, mit einem eigenen Zertifikat versehen und erst nach DNS-,
Host-Header- und SSL-Prüfung in FahrSeiten aktiviert.

Die Supportauskunft ersetzt keinen Last-, Ressourcen- oder Stagingtest. Offen
bleiben insbesondere verfügbare CPU-/RAM-Ressourcen, parallele Node-Anfragen,
persistenter Medienspeicher, Backup und Restore sowie das Verhalten bei einer
größeren Anzahl gleichzeitig aktiver Kundenwebsites.

Bis eine abweichende Tarifauskunft vorliegt, plant FahrSeiten deshalb mit
höchstens zwölf gleichzeitig zugewiesenen Domains fremder Registrare. Bei
netcup registrierte oder zusätzlich zu netcup übertragene Domains werden nach
der Supportauskunft nicht auf diese Grenze angerechnet.
