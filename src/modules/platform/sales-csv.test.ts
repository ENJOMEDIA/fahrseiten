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
    expect(row.note).toContain("Vor dem Erstkontakt");
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
      "Fahrschule;Ansprechpartner;E-Mail;Telefon;Webseite;Straße;PLZ;Ort;Land;Wiedervorlage;Notiz;Tags;Kommentare\nFahrschule Nord;;;;;Nordweg 1;12345;Musterstadt;Deutschland;;Rückfrage vorbereiten;Rechtlich veraltet|Aktuelle Wartungen;Rechtstexte vor Versand prüfen";
    expect(parseSalesCsv(source)[0]).toMatchObject({
      tags: ["Rechtlich veraltet", "Aktuelle Wartungen"],
      researchNote: "Rechtstexte vor Versand prüfen",
      note: "Rückfrage vorbereiten",
    });
  });

  it("liest weiterhin die bisherige Tags-Kommentar-Struktur", () => {
    const source =
      "Fahrschule;Ansprechpartner;E-Mail;Telefon;Webseite;Straße;PLZ;Ort;Land;Tags;Kommentar;Wiedervorlage\nFahrschule Süd;;;;;Südweg 2;54321;Beispielstadt;Deutschland;Aktuelle Wartungen;Website erneut prüfen;";
    expect(parseSalesCsv(source)[0]).toMatchObject({
      tags: ["Aktuelle Wartungen"],
      researchNote: "Website erneut prüfen",
      note: "Website erneut prüfen",
    });
  });
});
