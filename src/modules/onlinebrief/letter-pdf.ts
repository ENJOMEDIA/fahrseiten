import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import QRCode from "qrcode";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

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

export type AcquisitionLetterInput = {
  leadId: string;
  campaignUrl: string;
  recipient: {
    companyName: string;
    contactName: string | null;
    street: string;
    postalCode: string;
    city: string;
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
};

export async function createAcquisitionLetterPdf(
  input: AcquisitionLetterInput,
) {
  const document = await PDFDocument.create();
  const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const qrBytes = await QRCode.toBuffer(input.campaignUrl, {
    type: "png",
    width: 420,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#07111f", light: "#ffffff" },
  });
  const qr = await document.embedPng(qrBytes);

  page.drawText(
    `${input.sender.companyName} · ${input.sender.street} · ${input.sender.postalCode} ${input.sender.city}`,
    { x: 56, y: 746, size: 6.8, font: regular, color: rgb(0.35, 0.4, 0.47) },
  );
  const recipientLines = [
    input.recipient.companyName,
    input.recipient.contactName
      ? `z. Hd. ${input.recipient.contactName}`
      : null,
    input.recipient.street,
    `${input.recipient.postalCode} ${input.recipient.city}`,
    input.recipient.country === "Deutschland" ? null : input.recipient.country,
  ].filter((line): line is string => Boolean(line));
  recipientLines.forEach((line, index) =>
    page.drawText(line, {
      x: 56,
      y: 724 - index * 14,
      size: 10,
      font: regular,
      color: rgb(0.06, 0.09, 0.14),
    }),
  );

  page.drawRectangle({
    x: 0,
    y: 0,
    width: 18,
    height: PAGE_HEIGHT,
    color: rgb(0.03, 0.67, 0.76),
  });
  page.drawText("FAHRSEITEN", {
    x: 387,
    y: 782,
    size: 17,
    font: bold,
    color: rgb(0.03, 0.18, 0.27),
  });
  page.drawText("by ENJO MEDIA", {
    x: 449,
    y: 766,
    size: 7.5,
    font: bold,
    color: rgb(0.03, 0.55, 0.63),
  });

  let y = 606;
  const drawParagraph = (
    text: string,
    options: { bold?: boolean; size?: number } = {},
  ) => {
    const font = options.bold ? bold : regular;
    const size = options.size ?? 10.5;
    for (const line of wrapText(text, font, size, 470)) {
      page.drawText(line, {
        x: 56,
        y,
        size,
        font,
        color: rgb(0.07, 0.11, 0.17),
      });
      y -= size * 1.48;
    }
    y -= 10;
  };

  drawParagraph(
    `${input.recipient.contactName ? `Guten Tag ${input.recipient.contactName},` : "Guten Tag,"}`,
  );
  drawParagraph(
    "Ihre Fahrschulwebsite darf genauso modern sein wie Ihre Ausbildung.",
    {
      bold: true,
      size: 16,
    },
  );
  drawParagraph(
    "FahrSeiten ist eine neue Plattform von ENJO MEDIA, mit der Fahrschulen ihre Website, Inhalte, Anfragen und wichtigen Rechtstexte an einem Ort verwalten können. Klar aufgebaut, ohne technischen Daueraufwand und mit persönlicher Begleitung.",
  );
  drawParagraph(
    "Sie pflegen Führerscheinklassen, Preise, Kurse, Fahrzeuge, Team und Standorte selbst. Für das Design stehen kontrollierte Bausteine und Vorlagen bereit – damit die Seite hochwertig bleibt, auch wenn Inhalte später eigenständig geändert werden.",
  );
  drawParagraph(
    "Scannen Sie den persönlichen QR-Code und wählen Sie unverbindlich aus, ob Sie Interesse haben, weitere Informationen wünschen oder keine weitere Ansprache möchten.",
  );

  page.drawRectangle({
    x: 55,
    y: 105,
    width: 485,
    height: 150,
    color: rgb(0.94, 0.98, 0.99),
    borderColor: rgb(0.72, 0.91, 0.94),
    borderWidth: 1,
  });
  page.drawImage(qr, { x: 72, y: 120, width: 120, height: 120 });
  page.drawText("Ihre persönliche FahrSeiten-Auswahl", {
    x: 215,
    y: 214,
    size: 12,
    font: bold,
    color: rgb(0.03, 0.18, 0.27),
  });
  const linkLines = wrapText(input.campaignUrl, regular, 7.5, 300);
  linkLines.slice(0, 3).forEach((line, index) =>
    page.drawText(line, {
      x: 215,
      y: 190 - index * 11,
      size: 7.5,
      font: regular,
      color: rgb(0.1, 0.43, 0.5),
    }),
  );
  page.drawText(`Referenz: ${input.leadId}`, {
    x: 215,
    y: 142,
    size: 7,
    font: regular,
    color: rgb(0.4, 0.45, 0.52),
  });

  page.drawText(
    `${input.sender.representativeName} · ${input.sender.companyName} · ${input.sender.email}`,
    { x: 56, y: 62, size: 8, font: regular, color: rgb(0.34, 0.39, 0.45) },
  );
  page.drawText("Persönlich erstellt für Ihre Fahrschule.", {
    x: 56,
    y: 44,
    size: 7,
    font: regular,
    color: rgb(0.46, 0.51, 0.57),
  });
  return new Uint8Array(await document.save());
}
