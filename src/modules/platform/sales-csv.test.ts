import { describe, expect, it } from "vitest";
import { parseSalesCsv, salesCsvTemplate } from "./sales-csv";

describe("Akquise-CSV", () => {
  it("liest die bereitgestellte Vorlage ein", () => {
    const [row] = parseSalesCsv(salesCsvTemplate());
    expect(row).toMatchObject({
      companyName: "Beispiel Fahrschule",
      contactName: "Erika Muster",
    });
    expect(row.nextTaskAt).toBeInstanceOf(Date);
    expect(row.tags).toEqual(["Rechtlich veraltet", "Aktuelle Wartungen"]);
    expect(row.researchNote).toContain("Im Impressum");
  });

  it("unterstützt maskierte Trennzeichen", () => {
    const source =
      'Fahrschule,Ansprechpartner,E-Mail,Telefon,Webseite,Wiedervorlage,Notiz\n"Fahrschule A, B",,,,,,"Rückruf, später"';
    expect(parseSalesCsv(source)[0]).toMatchObject({
      companyName: "Fahrschule A, B",
      note: "Rückruf, später",
    });
  });

  it("übernimmt Tags und Kommentare aus der aktuellen Importstruktur", () => {
    const source =
      "Fahrschule;Ansprechpartner;E-Mail;Telefon;Webseite;Straße;PLZ;Ort;Land;Tags;Kommentar;Wiedervorlage\nFahrschule Nord;;;;;Nordweg 1;12345;Musterstadt;Deutschland;Rechtlich veraltet|Aktuelle Wartungen;Rechtstexte vor Versand prüfen;";
    expect(parseSalesCsv(source)[0]).toMatchObject({
      tags: ["Rechtlich veraltet", "Aktuelle Wartungen"],
      researchNote: "Rechtstexte vor Versand prüfen",
      note: "Rechtstexte vor Versand prüfen",
    });
  });
});
