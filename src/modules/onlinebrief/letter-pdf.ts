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
  brandLogoPng?: Uint8Array;
  heroImagePng?: Uint8Array;
  createdAt: Date;
  headline: string;
  bodyText: string;
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
  const brandLogo = input.brandLogoPng
    ? await document.embedPng(input.brandLogoPng)
    : null;
  const heroImage = input.heroImagePng
    ? await document.embedPng(input.heroImagePng)
    : null;

  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 13,
    width: PAGE_WIDTH,
    height: 13,
    color: rgb(0.03, 0.67, 0.76),
  });
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 18,
    height: PAGE_HEIGHT,
    color: rgb(0.03, 0.67, 0.76),
  });
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
  ]
    .filter((line): line is string => Boolean(line))
    .flatMap((line) => wrapText(line, regular, 9.5, 198));
  if (recipientLines.length > 6)
    throw new Error(
      "Die Empfängeranschrift ist für das Briefumschlagfenster zu lang.",
    );
  recipientLines.forEach((line, index) =>
    page.drawText(line, {
      x: 62,
      y: 678 - index * 14,
      size: 9.5,
      font: regular,
      color: rgb(0.06, 0.09, 0.14),
    }),
  );

  if (brandLogo) {
    const dimensions = brandLogo.scaleToFit(150, 46);
    page.drawImage(brandLogo, {
      x: 534 - dimensions.width,
      y: 802 - dimensions.height,
      width: dimensions.width,
      height: dimensions.height,
    });
  } else {
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
  }
  const weekday = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    timeZone: "Europe/Berlin",
  }).format(input.createdAt);
  const numericDate = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(input.createdAt);
  page.drawText(weekday + ", den " + numericDate, {
    x: 390,
    y: 646,
    size: 8,
    font: regular,
    color: rgb(0.35, 0.4, 0.47),
  });

  let y = 568;
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
  drawParagraph(input.headline, { bold: true, size: 16 });
  if (heroImage) {
    const dimensions = heroImage.scaleToFit(470, 58);
    page.drawRectangle({
      x: 55,
      y: y - 64,
      width: 485,
      height: 64,
      color: rgb(0.94, 0.98, 0.99),
    });
    page.drawImage(heroImage, {
      x: 62 + (471 - dimensions.width) / 2,
      y: y - 61 + (58 - dimensions.height) / 2,
      width: dimensions.width,
      height: dimensions.height,
    });
    y -= 76;
  }
  input.bodyText
    .split(/\n\n+/)
    .filter(Boolean)
    .forEach((paragraph) => drawParagraph(paragraph));
  if (y < 292)
    throw new Error(
      "Der Brieftext ist für das einseitige Layout zu lang. Bitte kürze ihn oder entferne das Bild.",
    );

  page.drawRectangle({
    x: 55,
    y: 92,
    width: 485,
    height: 184,
    color: rgb(0.955, 0.985, 0.99),
    borderColor: rgb(0.55, 0.84, 0.88),
    borderWidth: 1,
  });
  page.drawRectangle({
    x: 68,
    y: 109,
    width: 150,
    height: 150,
    color: rgb(1, 1, 1),
  });
  page.drawImage(qr, { x: 77, y: 118, width: 132, height: 132 });
  page.drawText("Ein Scan. Drei klare Möglichkeiten.", {
    x: 238,
    y: 239,
    size: 13,
    font: bold,
    color: rgb(0.03, 0.18, 0.27),
  });
  [
    "Sehen Sie, was für Ihre Fahrschule möglich ist.",
    "Fordern Sie Details an oder sagen Sie uns direkt,",
    "dass wir Sie nicht weiter ansprechen sollen.",
  ].forEach((line, index) =>
    page.drawText(line, {
      x: 238,
      y: 214 - index * 15,
      size: 8.8,
      font: regular,
      color: rgb(0.16, 0.23, 0.3),
    }),
  );
  page.drawText("Persönlich. Unverbindlich. Ohne Login.", {
    x: 238,
    y: 158,
    size: 8.5,
    font: bold,
    color: rgb(0.03, 0.55, 0.63),
  });
  page.drawText(
    "QR-Code scannen und in weniger als einer Minute entscheiden.",
    {
      x: 238,
      y: 139,
      size: 7.5,
      font: regular,
      color: rgb(0.34, 0.39, 0.45),
    },
  );
  page.drawText("Referenz " + input.leadId, {
    x: 238,
    y: 116,
    size: 5.8,
    font: regular,
    color: rgb(0.68, 0.71, 0.75),
  });

  page.drawLine({
    start: { x: 56, y: 70 },
    end: { x: 540, y: 70 },
    thickness: 0.7,
    color: rgb(0.86, 0.89, 0.92),
  });
  page.drawText(
    `${input.sender.representativeName} · ${input.sender.companyName} · ${input.sender.email}`,
    { x: 56, y: 54, size: 7.5, font: regular, color: rgb(0.34, 0.39, 0.45) },
  );
  page.drawText("FahrSeiten · Ihre Website fährt einfach mit.", {
    x: 56,
    y: 36,
    size: 7.2,
    font: bold,
    color: rgb(0.03, 0.55, 0.63),
  });
  return new Uint8Array(await document.save());
}
