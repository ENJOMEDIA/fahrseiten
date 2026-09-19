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
  kicker: string;
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

  page.drawText(
    input.recipient.contactName
      ? `Guten Tag ${input.recipient.contactName},`
      : "Guten Tag,",
    { x: 56, y, size: 9.5, font: regular, color: rgb(0.28, 0.34, 0.4) },
  );
  y -= 25;
  page.drawText(input.kicker.toUpperCase(), {
    x: 58,
    y,
    size: 7.2,
    font: bold,
    color: rgb(0.02, 0.53, 0.6),
  });
  y -= 13;
  const headlineLines = wrapText(input.headline, bold, 16.5, 445);
  if (headlineLines.length > 2)
    throw new Error("Die Briefüberschrift darf höchstens zwei Zeilen belegen.");
  const headlineHeight = headlineLines.length === 1 ? 56 : 72;
  for (let index = 0; index < 48; index += 1) {
    const progress = index / 47;
    page.drawRectangle({
      x: 55 + (485 / 48) * index,
      y: y - headlineHeight,
      width: 485 / 48 + 0.5,
      height: headlineHeight,
      color: rgb(
        0.02 + progress * 0.01,
        0.63 - progress * 0.47,
        0.67 - progress * 0.47,
      ),
    });
  }
  headlineLines.forEach((line, index) =>
    page.drawText(line, {
      x: 73,
      y: y - 25 - index * 21,
      size: 16.5,
      font: bold,
      color: rgb(1, 1, 1),
    }),
  );
  y -= headlineHeight + 12;
  if (heroImage) {
    const dimensions = heroImage.scaleToFit(470, 46);
    page.drawRectangle({
      x: 55,
      y: y - 52,
      width: 485,
      height: 52,
      color: rgb(0.94, 0.98, 0.99),
    });
    page.drawImage(heroImage, {
      x: 62 + (471 - dimensions.width) / 2,
      y: y - 49 + (46 - dimensions.height) / 2,
      width: dimensions.width,
      height: dimensions.height,
    });
    y -= 62;
  }
  const bodyBlocks = input.bodyText.split(/\n\n+/).filter(Boolean);
  bodyBlocks.forEach((block, blockIndex) => {
    const bulletLines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (
      bulletLines.length &&
      bulletLines.every((line) => /^[•-]\s/.test(line))
    ) {
      bulletLines.forEach((line) => {
        page.drawCircle({
          x: 63,
          y: y + 3,
          size: 3.2,
          color: rgb(0.03, 0.65, 0.7),
        });
        const lines = wrapText(line.replace(/^[•-]\s*/, ""), bold, 9.4, 448);
        lines.forEach((item, index) =>
          page.drawText(item, {
            x: 76,
            y: y - index * 13.5,
            size: 9.4,
            font: bold,
            color: rgb(0.06, 0.13, 0.2),
          }),
        );
        y -= lines.length * 13.5 + 5;
      });
      y -= 3;
      return;
    }
    if (blockIndex === 0) {
      const lines = wrapText(block, regular, 10.2, 438);
      const height = lines.length * 15 + 20;
      page.drawRectangle({
        x: 55,
        y: y - height + 5,
        width: 485,
        height,
        color: rgb(0.95, 0.985, 0.99),
      });
      page.drawRectangle({
        x: 55,
        y: y - height + 5,
        width: 5,
        height,
        color: rgb(0.03, 0.65, 0.7),
      });
      lines.forEach((line, index) =>
        page.drawText(line, {
          x: 72,
          y: y - 8 - index * 15,
          size: 10.2,
          font: regular,
          color: rgb(0.08, 0.16, 0.23),
        }),
      );
      y -= height + 7;
      return;
    }
    drawParagraph(block, { size: 9.6 });
  });
  if (y < 248)
    throw new Error(
      "Der Brieftext ist für das einseitige Layout zu lang. Bitte kürze ihn oder entferne das Bild.",
    );

  page.drawRectangle({
    x: 55,
    y: 92,
    width: 485,
    height: 142,
    color: rgb(0.955, 0.985, 0.99),
    borderColor: rgb(0.55, 0.84, 0.88),
    borderWidth: 1,
  });
  page.drawRectangle({
    x: 68,
    y: 103,
    width: 120,
    height: 120,
    color: rgb(1, 1, 1),
  });
  page.drawImage(qr, { x: 75, y: 110, width: 106, height: 106 });
  page.drawText("Ein Scan. Drei klare Möglichkeiten.", {
    x: 207,
    y: 207,
    size: 12.5,
    font: bold,
    color: rgb(0.03, 0.18, 0.27),
  });
  [
    "Sehen Sie, was für Ihre Fahrschule möglich ist.",
    "Fordern Sie Details an oder sagen Sie uns direkt,",
    "dass wir Sie nicht weiter ansprechen sollen.",
  ].forEach((line, index) =>
    page.drawText(line, {
      x: 207,
      y: 184 - index * 13,
      size: 8.2,
      font: regular,
      color: rgb(0.16, 0.23, 0.3),
    }),
  );
  page.drawText("Persönlich. Unverbindlich. Ohne Login.", {
    x: 207,
    y: 139,
    size: 8.2,
    font: bold,
    color: rgb(0.03, 0.55, 0.63),
  });
  page.drawText(
    "QR-Code scannen und in weniger als einer Minute entscheiden.",
    {
      x: 207,
      y: 122,
      size: 7,
      font: regular,
      color: rgb(0.34, 0.39, 0.45),
    },
  );
  page.drawText("Referenz " + input.leadId, {
    x: 207,
    y: 105,
    size: 5.5,
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
  page.drawText("Datenschutz und Werbewiderspruch: fahrseiten.de/datenschutz", {
    x: 310,
    y: 36,
    size: 6.3,
    font: regular,
    color: rgb(0.4, 0.44, 0.49),
  });
  return new Uint8Array(await document.save());
}
