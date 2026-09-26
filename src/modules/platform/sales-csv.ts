import { z } from "zod";
import { parseSalesLeadTags } from "./sales-tags";

export const salesCsvHeaders = [
  "Fahrschule",
  "Ansprechpartner",
  "E-Mail",
  "Telefon",
  "Webseite",
  "Straße",
  "PLZ",
  "Ort",
  "Land",
  "Wiedervorlage",
  "Notiz",
  "Tags",
  "Kommentare",
] as const;

const taggedSalesCsvHeaders = [
  "Fahrschule",
  "Ansprechpartner",
  "E-Mail",
  "Telefon",
  "Webseite",
  "Straße",
  "PLZ",
  "Ort",
  "Land",
  "Tags",
  "Kommentar",
  "Wiedervorlage",
] as const;

const addressSalesCsvHeaders = [
  "Fahrschule",
  "Ansprechpartner",
  "E-Mail",
  "Telefon",
  "Webseite",
  "Straße",
  "PLZ",
  "Ort",
  "Land",
  "Wiedervorlage",
  "Notiz",
] as const;

const legacySalesCsvHeaders = [
  "Fahrschule",
  "Ansprechpartner",
  "E-Mail",
  "Telefon",
  "Webseite",
  "Wiedervorlage",
  "Notiz",
] as const;

export type SalesCsvRow = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  tags: string[];
  researchNote: string;
  nextTaskAt: Date | null;
  note: string;
};

function parseLine(line: string, separator: string) {
  const cells: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === separator && !quoted) {
      cells.push(value.trim());
      value = "";
    } else value += character;
  }
  if (quoted)
    throw new Error("Nicht geschlossenes Anführungszeichen in CSV-Datei.");
  cells.push(value.trim());
  return cells;
}

function parseDate(value: string) {
  if (!value) return null;
  const german = /^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?$/.exec(
    value,
  );
  const date = german
    ? new Date(
        `${german[3]}-${german[2]}-${german[1]}T${german[4] ?? "09"}:${german[5] ?? "00"}:00`,
      )
    : new Date(value);
  if (Number.isNaN(date.getTime()))
    throw new Error(`Ungültige Wiedervorlage: ${value}`);
  return date;
}

export function parseSalesCsv(source: string): SalesCsvRow[] {
  const lines = source
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (lines.length < 2)
    throw new Error("Die CSV-Datei enthält keine Kontakte.");
  if (lines.length > 1_001)
    throw new Error("Pro Import sind höchstens 1.000 Kontakte erlaubt.");
  const separator =
    (lines[0].match(/;/g)?.length ?? 0) >= (lines[0].match(/,/g)?.length ?? 0)
      ? ";"
      : ",";
  const headers = parseLine(lines[0], separator);
  const current =
    headers.every((header, index) => header === salesCsvHeaders[index]) &&
    headers.length === salesCsvHeaders.length;
  const tagged =
    headers.length === taggedSalesCsvHeaders.length &&
    headers.every(
      (header, index) =>
        header === taggedSalesCsvHeaders[index] ||
        (index === 10 && header === "Kommentare"),
    );
  const address =
    headers.every(
      (header, index) => header === addressSalesCsvHeaders[index],
    ) && headers.length === addressSalesCsvHeaders.length;
  const legacy =
    headers.length === legacySalesCsvHeaders.length &&
    headers.every((header, index) => header === legacySalesCsvHeaders[index]);
  if (!current && !tagged && !address && !legacy)
    throw new Error(
      `Die Kopfzeile muss exakt lauten: ${salesCsvHeaders.join(separator)}`,
    );

  return lines.slice(1).map((line, index) => {
    const cells = parseLine(line, separator);
    if (cells.length !== headers.length)
      throw new Error(
        `Zeile ${index + 2} hat nicht genau ${headers.length} Spalten.`,
      );
    const companyName = z.string().trim().min(2).max(180).parse(cells[0]);
    const email = cells[2] ? z.email().parse(cells[2]) : "";
    const website = cells[4] ? z.url().parse(cells[4]) : "";
    const hasAddress = current || tagged || address;
    const addressOffset = hasAddress ? 4 : 0;
    const note = current
      ? cells[10]
      : tagged
        ? cells[10]
        : cells[6 + addressOffset];
    const researchNote = current ? cells[12] : note;
    return {
      companyName,
      contactName: z.string().trim().max(160).parse(cells[1]),
      email,
      phone: z.string().trim().max(40).parse(cells[3]),
      website,
      street: hasAddress ? z.string().trim().max(180).parse(cells[5]) : "",
      postalCode: hasAddress ? z.string().trim().max(20).parse(cells[6]) : "",
      city: hasAddress ? z.string().trim().max(120).parse(cells[7]) : "",
      country: hasAddress
        ? z.string().trim().max(120).parse(cells[8]) || "Deutschland"
        : "Deutschland",
      tags: current
        ? parseSalesLeadTags(cells[11])
        : tagged
          ? parseSalesLeadTags(cells[9])
          : [],
      researchNote: z.string().trim().max(3_000).parse(researchNote),
      nextTaskAt: parseDate(
        current ? cells[9] : tagged ? cells[11] : cells[5 + addressOffset],
      ),
      note: z.string().trim().max(3_000).parse(note),
    };
  });
}

export function salesCsvTemplate() {
  return `${salesCsvHeaders.join(";")}\nBeispiel Fahrschule;Erika Muster;erika@example.invalid;+49 000 000000;https://example.invalid;Musterstraße 1;12345;Musterstadt;Deutschland;30.09.2026 09:00;Vor dem Erstkontakt noch einmal manuell prüfen.;Rechtlich veraltet|Aktuelle Wartungen;Im Impressum wirken einzelne Angaben nicht mehr aktuell.\n`;
}
