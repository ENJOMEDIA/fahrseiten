# Datenschutz- und Consent-Grundlage

Stand: 17. September 2026.

## Technisches Modell

Plattform und Mandanten verwalten die rechtlichen Ausgangsdaten strukturiert in `legal_profiles`. Der geführte Builder fragt Anbieter, Anschrift, Kontakt, Rechtsform, Register, Aufsicht, redaktionelle Verantwortung, Datenschutzkontakt, Hosting und Löschfrist als einzelne validierte Felder ab. Freier Klartext ist für veröffentlichte Dokumente nicht vorgesehen. Aus dem Profil und den aktiven Modulen entstehen Impressum und Datenschutz automatisiert; jede Veröffentlichung wird weiterhin als unveränderlicher Snapshot in `legal_documents` versioniert.

Für Mandanten werden Kontaktformular, E-Mail und Consent technisch vorausgesetzt. Freigeschaltete Features wie Terminbuchung, SMS/WhatsApp, Zahlungen, Analytics und Anzeigenkampagnen aktivieren die zugehörigen Datenschutzmodule serverseitig. Weitere externe Dienste können im Builder vorbereitet werden. Ein deaktiviertes Formularfeld kann ein tatsächlich freigeschaltetes Feature nicht aus dem Rechtstext entfernen.

Die Consent-Steuerung kennt notwendig, funktional, Statistik und Marketing. Notwendig ist immer aktiv. Ohne gültiges Cookie der aktuellen, aus den aktiven Diensten berechneten Hinweisversion liefert `mayLoadOptional` für jede optionale Kategorie `false`. `OptionalContent` rendert deshalb zunächst nur einen lokalen Platzhalter und löst keinen externen Request aus. Ein Banner erscheint nur, wenn durch ein aktives Modul oder über die `CONSENT_*_SERVICES`-Konfiguration tatsächlich mindestens ein optionaler Dienst benannt ist. Ändert sich diese Diensteliste, wird die Auswahl erneut abgefragt. Ohne optionalen Dienst wird keine Einwilligung ins Blaue hinein abgefragt.

Der Browser speichert die Auswahl für höchstens 180 Tage. Änderungen am Versionsschlüssel machen alte Auswahlwerte ungültig. Auswahl und Widerruf sind auf der Seite Cookie-Einstellungen erneut erreichbar. Der API-Nachweis speichert einen SHA-256-Hash einer zufälligen Browserkennung, Hinweisversion, Kategorien, Host und Zeitpunkte; rohe IP-Adresse, User-Agent und Browserkennung werden nicht gespeichert.

## Vorbereitete Prozesse

`privacy_requests` bildet Export- und Löschanforderungen mit Status und nur gehashter Anfordereradresse ab. `retention_policies` hält später je Datenkategorie festzulegende Aufbewahrungswerte. `subprocessors` macht die Liste eingesetzter Unterauftragnehmer konfigurierbar. Es sind noch keine geschäftlich oder rechtlich verbindlichen Fristen, Anbieter oder Rechtsgrundlagen hinterlegt.

Für Akquise-E-Mails protokolliert die Plattform ausschließlich den technischen Job- und SMTP-Status. Unsichtbare Öffnungspixel sind nicht aktiv: Die Datenschutzkonferenz weist darauf hin, dass E-Mail-Tracking-Pixel eine vorherige Einwilligung der empfangenden Person benötigen. Zusätzlich ist vor jeder Werbe-E-Mail zu prüfen und zu dokumentieren, ob die Voraussetzungen des § 7 UWG erfüllt sind. „Vom SMTP-Server angenommen“ bedeutet weder sicher zugestellt noch gelesen.

## Grenzen und manuelle Prüfung

- MySQL war lokal nicht verfügbar; Migration und Repository müssen vor Staging gegen eine Testdatenbank geprüft werden.
- Die Generatorbausteine liefern eine belastbare technische Struktur, aber keine individuelle Rechtsberatung. Anbieter, Verträge, Auftragsverarbeitung, Drittlandtransfers, konkrete Speicherdauern und die rechtliche Einordnung der tatsächlichen Nutzung müssen vor Veröffentlichung geprüft werden.
- Tenant-Auflösung für Consent-Nachweise wird vor Einsatz auf externen Kundendomains mit dem geprüften Serverkontext verbunden.
- Cookie ablehnen, selektiv zustimmen, erneut öffnen und widerrufen; dabei prüfen, dass der optionale Beispielinhalt nur bei funktionaler Freigabe erscheint.
- Rechtstext-Warnungen mit fehlenden Pflichtbereichen prüfen und sicherstellen, dass keine produktiven Platzhalter veröffentlicht werden.

## KI-Unterstützung und Kennzeichnung

Für eine normale Website besteht nach der geprüften Fassung des EU AI Act keine allgemeine Pflicht, im Footer offenzulegen, dass KI bei Entwurf oder Umsetzung unterstützt hat. Artikel 50 regelt insbesondere die Erkennbarkeit direkter Interaktion mit einem KI-System, technisch erkennbare KI-Ausgaben sowie die Kennzeichnung von Deepfakes und bestimmten Texten zu Angelegenheiten von öffentlichem Interesse. FahrSeiten veröffentlicht Inhalte erst unter Verantwortung des jeweiligen Betreibers; eine pauschale Aussage wie „autonom erstellt“ wäre deshalb sachlich missverständlich.

Der optionale, diskrete Produktverweis „Mit FahrSeiten und viel Liebe erstellt“ beschreibt das eingesetzte System, behauptet keine autonome Urheberschaft und ersetzt keine Prüfung von Texten, Bildern, Rechten oder Pflichtangaben durch den Betreiber.

## Geprüfte Rechtsgrundlagen

Technischer Prüfstand: 17. September 2026. § 5 DDG verlangt für geschäftsmäßige digitale Dienste insbesondere leicht erkennbare, unmittelbar erreichbare und ständig verfügbare Angaben zu Name, Anschrift, elektronischem Kontakt sowie je nach Fall Rechtsform, Vertretung, Register, Aufsicht und Umsatzsteuer-ID. § 18 MStV kann bei journalistisch-redaktionellen Angeboten eine verantwortliche Person erfordern. Deshalb fragt das Onboarding diese Angaben ab, lässt fallabhängige Felder optional und erzeugt nur einen prüfpflichtigen Entwurf.

Art. 13 DSGVO verlangt unter anderem Informationen zu Verantwortlichem, Zwecken und Rechtsgrundlagen, Empfängern, Speicherdauer, Rechten und gegebenenfalls Drittlandübermittlungen. Der Builder erzeugt dafür feste Abschnitte und ergänzt modulabhängige Verarbeitungsvorgänge. Konkrete externe Anbieter und Transfers hängen weiterhin von der tatsächlichen Konfiguration ab und müssen vor Aktivierung vollständig hinterlegt und geprüft werden.

Nach § 25 TDDDG benötigen nicht unbedingt erforderliche Zugriffe auf das Endgerät grundsätzlich eine vorherige Einwilligung; die Ausnahmen gelten nur für Übertragung oder einen ausdrücklich gewünschten, unbedingt erforderlichen Dienst. Art. 7 DSGVO verlangt unter anderem Nachweisbarkeit und einen ebenso einfachen Widerruf. Die Kategorien bleiben daher standardmäßig aus, Ablehnung und Zustimmung stehen auf derselben Ebene, und die Einstellungen bleiben erneut erreichbar.

Primärquellen: [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html), [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html), [§ 7 UWG](https://www.gesetze-im-internet.de/uwg_2004/__7.html), [DSGVO auf EUR-Lex](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679), [DSK-Hinweis zu E-Mail-Tracking-Pixeln](https://datenschutzkonferenz-online.de/media/pm/DSK_PM_110_DSK.pdf), [Artikel 50 EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27/eng), [§ 18 MStV](https://www.die-medienanstalten.de/fileadmin/user_upload/Rechtsgrundlagen/Gesetze_Staatsvertraege/Medienstaatsvertrag_MStV.pdf).
