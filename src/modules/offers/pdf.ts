import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

import type { SalesOfferItem } from "@/db/schema";

const WIDTH = 595.28;
const HEIGHT = 841.89;

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.replace(/\s+/g, " ").trim().split(" ")) {
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

const money = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export async function createSalesOfferPdf(input: {
  offerNumber: string;
  title: string;
  validUntil: Date;
  introduction: string | null;
  items: SalesOfferItem[];
  netTotalCents: number;
  vatRateBasisPoints: number;
  recipient: {
    companyName: string;
    contactName: string | null;
    street: string | null;
    postalCode: string | null;
    city: string | null;
    country: string;
  };
  sender: {
    companyName: string;
    representativeName: string;
    street: string;
    postalCode: string;
    city: string;
    email: string;
  };
}) {
  const document = await PDFDocument.create();
  const page = document.addPage([WIDTH, HEIGHT]);
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  page.drawRectangle({
    x: 0,
    y: 690,
    width: WIDTH,
    height: 152,
    color: rgb(0.035, 0.067, 0.12),
  });
  page.drawText("FAHRSEITEN", {
    x: 48,
    y: 786,
    size: 12,
    font: bold,
    color: rgb(0.25, 0.9, 0.9),
  });
  page.drawText("Persönliches Angebot", {
    x: 48,
    y: 741,
    size: 24,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText(
    `${input.offerNumber} · gültig bis ${input.validUntil.toLocaleDateString("de-DE")}`,
    { x: 48, y: 714, size: 9, font: regular, color: rgb(0.78, 0.84, 0.9) },
  );

  let y = 650;
  const recipient = [
    input.recipient.companyName,
    input.recipient.contactName
      ? `z. Hd. ${input.recipient.contactName}`
      : null,
    input.recipient.street,
    input.recipient.postalCode && input.recipient.city
      ? `${input.recipient.postalCode} ${input.recipient.city}`
      : null,
    input.recipient.country === "Deutschland" ? null : input.recipient.country,
  ].filter((line): line is string => Boolean(line));
  recipient.forEach((line) => {
    page.drawText(line, {
      x: 48,
      y,
      size: 9,
      font: regular,
      color: rgb(0.12, 0.16, 0.22),
    });
    y -= 13;
  });
  y -= 18;
  page.drawText(input.title, {
    x: 48,
    y,
    size: 16,
    font: bold,
    color: rgb(0.03, 0.18, 0.27),
  });
  y -= 28;
  if (input.introduction) {
    for (const line of wrap(input.introduction, regular, 9.5, 495)) {
      page.drawText(line, {
        x: 48,
        y,
        size: 9.5,
        font: regular,
        color: rgb(0.18, 0.22, 0.28),
      });
      y -= 14;
    }
    y -= 15;
  }

  page.drawRectangle({
    x: 48,
    y: y - 6,
    width: 499,
    height: 26,
    color: rgb(0.93, 0.97, 0.98),
  });
  page.drawText("Leistung", {
    x: 58,
    y: y + 3,
    size: 8,
    font: bold,
    color: rgb(0.18, 0.27, 0.32),
  });
  page.drawText("Menge", {
    x: 405,
    y: y + 3,
    size: 8,
    font: bold,
    color: rgb(0.18, 0.27, 0.32),
  });
  page.drawText("Gesamt", {
    x: 482,
    y: y + 3,
    size: 8,
    font: bold,
    color: rgb(0.18, 0.27, 0.32),
  });
  y -= 30;
  for (const item of input.items) {
    const lines = wrap(item.description, regular, 9, 325);
    lines.forEach((line, index) =>
      page.drawText(line, {
        x: 58,
        y: y - index * 13,
        size: 9,
        font: regular,
        color: rgb(0.12, 0.16, 0.22),
      }),
    );
    page.drawText(String(item.quantity), {
      x: 414,
      y,
      size: 9,
      font: regular,
      color: rgb(0.12, 0.16, 0.22),
    });
    page.drawText(money.format((item.quantity * item.unitPriceCents) / 100), {
      x: 475,
      y,
      size: 9,
      font: regular,
      color: rgb(0.12, 0.16, 0.22),
    });
    y -= Math.max(30, lines.length * 13 + 12);
    page.drawLine({
      start: { x: 48, y: y + 12 },
      end: { x: 547, y: y + 12 },
      thickness: 0.5,
      color: rgb(0.86, 0.89, 0.92),
    });
  }
  const vatCents = Math.round(
    (input.netTotalCents * input.vatRateBasisPoints) / 10_000,
  );
  const grossCents = input.netTotalCents + vatCents;
  const totals = [
    ["Netto", input.netTotalCents],
    [
      `Umsatzsteuer ${(input.vatRateBasisPoints / 100).toLocaleString("de-DE")} %`,
      vatCents,
    ],
    ["Gesamt", grossCents],
  ] as const;
  y -= 4;
  totals.forEach(([label, cents], index) => {
    page.drawText(label, {
      x: 372,
      y,
      size: index === 2 ? 10 : 9,
      font: index === 2 ? bold : regular,
      color: rgb(0.08, 0.13, 0.18),
    });
    page.drawText(money.format(cents / 100), {
      x: 482,
      y,
      size: index === 2 ? 10 : 9,
      font: index === 2 ? bold : regular,
      color: rgb(0.08, 0.13, 0.18),
    });
    y -= 18;
  });
  page.drawText(
    "Dieses Angebot wird zusammen mit Leistungsbeschreibung, Vertrag und den vereinbarten Bedingungen verbindlich.",
    { x: 48, y: 82, size: 7.5, font: regular, color: rgb(0.42, 0.46, 0.52) },
  );
  page.drawText(
    `${input.sender.companyName} · ${input.sender.representativeName} · ${input.sender.street} · ${input.sender.postalCode} ${input.sender.city} · ${input.sender.email}`,
    { x: 48, y: 48, size: 6.8, font: regular, color: rgb(0.42, 0.46, 0.52) },
  );
  return new Uint8Array(await document.save());
}
