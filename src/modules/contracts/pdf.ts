import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

import { createContractSections, type ContractTemplateInput } from "./template";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 52;
const TEXT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function wrapText(text: string, font: PDFFont, size: number, width: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) line = candidate;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function createContractPdf(input: ContractTemplateInput) {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const brandLogo = input.brandLogoPng
    ? await document.embedPng(input.brandLogoPng)
    : null;
  const pages: ReturnType<typeof document.addPage>[] = [];
  let page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  pages.push(page);
  let y = PAGE_HEIGHT - MARGIN;

  const addPage = () => {
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    y = PAGE_HEIGHT - MARGIN;
  };
  const ensure = (height: number) => {
    if (y - height < 66) addPage();
  };
  const drawLines = (
    text: string,
    options: {
      font?: PDFFont;
      size?: number;
      color?: ReturnType<typeof rgb>;
      gap?: number;
    } = {},
  ) => {
    const font = options.font ?? regular;
    const size = options.size ?? 9.5;
    const lineHeight = size * 1.48;
    const lines = wrapText(text, font, size, TEXT_WIDTH);
    ensure(lines.length * lineHeight + (options.gap ?? 0));
    for (const line of lines) {
      page.drawText(line, {
        x: MARGIN,
        y,
        size,
        font,
        color: options.color ?? rgb(0.12, 0.16, 0.22),
      });
      y -= lineHeight;
    }
    y -= options.gap ?? 0;
  };

  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 172,
    width: PAGE_WIDTH,
    height: 172,
    color: rgb(0.035, 0.067, 0.12),
  });
  if (brandLogo) {
    page.drawRectangle({
      x: MARGIN - 8,
      y: PAGE_HEIGHT - 82,
      width: 171,
      height: 50,
      color: rgb(1, 1, 1),
      opacity: 0.96,
    });
    const dimensions = brandLogo.scaleToFit(151, 36);
    page.drawImage(brandLogo, {
      x: MARGIN,
      y: PAGE_HEIGHT - 57 - dimensions.height / 2,
      width: dimensions.width,
      height: dimensions.height,
    });
  } else {
    page.drawText("FAHRSEITEN", {
      x: MARGIN,
      y: PAGE_HEIGHT - 62,
      font: bold,
      size: 11,
      color: rgb(0.25, 0.9, 0.9),
    });
  }
  page.drawText("SaaS-Nutzungs- und Betreuungsvertrag", {
    x: MARGIN,
    y: PAGE_HEIGHT - 101,
    font: bold,
    size: 22,
    color: rgb(1, 1, 1),
  });
  page.drawText(
    `Vertrag ${input.contractNumber} · Kunde ${input.customerNumber}`,
    {
      x: MARGIN,
      y: PAGE_HEIGHT - 130,
      font: regular,
      size: 10,
      color: rgb(0.78, 0.84, 0.9),
    },
  );
  y = PAGE_HEIGHT - 205;

  drawLines("Vertragspartner", { font: bold, size: 12, gap: 8 });
  drawLines(
    `${input.provider.companyName}, vertreten durch ${input.provider.representativeName}, ${input.provider.street}, ${input.provider.postalCode} ${input.provider.city}, ${input.provider.country} (Anbieter)`,
    { gap: 5 },
  );
  drawLines(
    `${input.customer.companyName}${input.customer.recipientName ? `, z. Hd. ${input.customer.recipientName}` : ""}, ${input.customer.street}, ${input.customer.postalCode} ${input.customer.city}, ${input.customer.country} (Kunde)`,
    { gap: 15 },
  );

  for (const section of createContractSections(input)) {
    ensure(56);
    drawLines(section.heading, {
      font: bold,
      size: 11.5,
      color: rgb(0.02, 0.45, 0.53),
      gap: 5,
    });
    for (const paragraph of section.paragraphs)
      drawLines(paragraph, { gap: 8 });
    y -= 3;
  }

  ensure(145);
  drawLines("Bestätigung", { font: bold, size: 11.5, gap: 8 });
  drawLines(
    "Dieses Vertragsdokument bildet die für den Kunden gespeicherten Stammdaten und Konditionen ab. Vor dem Versand zur Unterschrift bestätigt der Anbieter, Angaben, Leistungsbeschreibung, Angebot, AGB und gegebenenfalls die Auftragsverarbeitungsvereinbarung auf den konkreten Abschluss geprüft zu haben.",
    { gap: 22 },
  );
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: MARGIN + 205, y },
    thickness: 0.7,
    color: rgb(0.55, 0.59, 0.64),
  });
  page.drawLine({
    start: { x: PAGE_WIDTH - MARGIN - 205, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 0.7,
    color: rgb(0.55, 0.59, 0.64),
  });
  page.drawText("Ort, Datum · Anbieter", {
    x: MARGIN,
    y: y - 16,
    size: 8,
    font: regular,
    color: rgb(0.4, 0.44, 0.5),
  });
  page.drawText("Ort, Datum · Kunde", {
    x: PAGE_WIDTH - MARGIN - 205,
    y: y - 16,
    size: 8,
    font: regular,
    color: rgb(0.4, 0.44, 0.5),
  });

  pages.forEach((item, index) => {
    item.drawLine({
      start: { x: MARGIN, y: 46 },
      end: { x: PAGE_WIDTH - MARGIN, y: 46 },
      thickness: 0.5,
      color: rgb(0.84, 0.87, 0.9),
    });
    item.drawText(
      `${input.contractNumber} · Seite ${index + 1} von ${pages.length}`,
      {
        x: MARGIN,
        y: 29,
        size: 7.5,
        font: regular,
        color: rgb(0.42, 0.46, 0.52),
      },
    );
  });
  return new Uint8Array(await document.save());
}
