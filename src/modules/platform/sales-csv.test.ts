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
  });

  it("unterstützt maskierte Trennzeichen", () => {
    const source =
      'Fahrschule,Ansprechpartner,E-Mail,Telefon,Webseite,Wiedervorlage,Notiz\n"Fahrschule A, B",,,,,,"Rückruf, später"';
    expect(parseSalesCsv(source)[0]).toMatchObject({
      companyName: "Fahrschule A, B",
      note: "Rückruf, später",
    });
  });
});
