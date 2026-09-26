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

export type LetterBodySegment =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "bullets"; items: string[] };

export function parseLetterBody(value: string): LetterBodySegment[] {
  const segments: LetterBodySegment[] = [];
  let paragraph: string[] = [];
  let bullets: string[] = [];
  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    if (text) segments.push({ type: "paragraph", text });
    paragraph = [];
  };
  const flushBullets = () => {
    if (bullets.length) segments.push({ type: "bullets", items: bullets });
    bullets = [];
  };
  for (const rawLine of value.replaceAll("\r\n", "\n").split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushBullets();
      continue;
    }
    const bullet = line.match(/^[•*-]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      bullets.push(bullet[1]);
      continue;
    }
    flushBullets();
    const heading = line.match(/^(?:#{1,3}\s+|\*\*)(.+?)(?:\*\*)?$/);
    if (heading && (line.startsWith("#") || line.startsWith("**"))) {
      flushParagraph();
      segments.push({ type: "heading", text: heading[1] });
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  flushBullets();
  return segments;
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
  // pdf-lib performs a realm-sensitive type check. Normalizing Node Buffers to
  // a plain Uint8Array also keeps PDF creation stable in tests and workers.
  const qr = await document.embedPng(Uint8Array.from(qrBytes));
  const brandLogo = input.brandLogoPng
    ? await document.embedPng(input.brandLogoPng)
    : null;
  const heroImage = input.heroImagePng
    ? await document.embedPng(input.heroImagePng)
    : null;

  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 9,
    width: PAGE_WIDTH,
    height: 9,
    color: rgb(0.03, 0.67, 0.76),
  });
  page.drawRectangle({
    x: 8,
    y: 756,
    width: PAGE_WIDTH - 8,
    height: 77,
    color: rgb(0.95, 0.985, 0.99),
  });
  page.drawRectangle({
    x: 8,
    y: 756,
    width: 252,
    height: 77,
    color: rgb(0.025, 0.075, 0.13),
  });
  page.drawCircle({
    x: 244,
    y: 817,
    size: 46,
    color: rgb(0.03, 0.67, 0.76),
    opacity: 0.2,
  });
  page.drawText("DIGITALER VORSPRUNG", {
    x: 40,
    y: 800,
    size: 7.2,
    font: bold,
    color: rgb(0.22, 0.83, 0.88),
  });
  page.drawText("FÜR FAHRSCHULEN", {
    x: 40,
    y: 777,
    size: 17,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 8,
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
    const dimensions = brandLogo.scaleToFit(190, 55);
    page.drawImage(brandLogo, {
      x: 540 - dimensions.width,
      y: 794 - dimensions.height / 2,
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
  const dateLabel = weekday + ", den " + numericDate;
  page.drawText(dateLabel, {
    x: 540 - regular.widthOfTextAtSize(dateLabel, 8),
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
  const bodySegments = parseLetterBody(input.bodyText);
  let paragraphIndex = 0;
  bodySegments.forEach((segment) => {
    if (segment.type === "heading") {
      for (const line of wrapText(segment.text, bold, 11.2, 460)) {
        page.drawText(line, {
          x: 56,
          y,
          size: 11.2,
          font: bold,
          color: rgb(0.02, 0.45, 0.53),
        });
        y -= 15;
      }
      y -= 3;
      return;
    }
    if (segment.type === "bullets") {
      segment.items.forEach((item) => {
        page.drawCircle({
          x: 63,
          y: y + 3,
          size: 3.2,
          color: rgb(0.03, 0.65, 0.7),
        });
        const lines = wrapText(item, bold, 9.4, 448);
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
    if (paragraphIndex === 0) {
      const lines = wrapText(segment.text, regular, 10.2, 438);
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
      paragraphIndex += 1;
      return;
    }
    drawParagraph(segment.text, { size: 9.6 });
    paragraphIndex += 1;
  });
  if (y < 248)
    throw new Error(
      "Der Brieftext ist für das einseitige Layout zu lang. Bitte kürze ihn oder entferne das Bild.",
    );

  const responsePanelY = Math.max(92, Math.min(180, y - 158));
  page.drawRectangle({
    x: 55,
    y: responsePanelY,
    width: 485,
    height: 142,
    color: rgb(0.955, 0.985, 0.99),
    borderColor: rgb(0.55, 0.84, 0.88),
    borderWidth: 1,
  });
  page.drawRectangle({
    x: 68,
    y: responsePanelY + 11,
    width: 120,
    height: 120,
    color: rgb(1, 1, 1),
  });
  page.drawImage(qr, {
    x: 75,
    y: responsePanelY + 18,
    width: 106,
    height: 106,
  });
  page.drawText("Ein Scan. Drei klare Möglichkeiten.", {
    x: 207,
    y: responsePanelY + 115,
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
      y: responsePanelY + 92 - index * 13,
      size: 8.2,
      font: regular,
      color: rgb(0.16, 0.23, 0.3),
    }),
  );
  const responseOptions = [
    {
      label: "INTERESSE",
      x: 207,
      width: 69,
      color: rgb(0.03, 0.55, 0.63),
      text: rgb(1, 1, 1),
    },
    {
      label: "MEHR INFOS",
      x: 282,
      width: 78,
      color: rgb(0.87, 0.96, 0.98),
      text: rgb(0.03, 0.28, 0.34),
    },
    {
      label: "KEIN INTERESSE",
      x: 366,
      width: 98,
      color: rgb(0.9, 0.92, 0.94),
      text: rgb(0.2, 0.24, 0.29),
    },
  ];
  responseOptions.forEach((option) => {
    page.drawRectangle({
      x: option.x,
      y: responsePanelY + 34,
      width: option.width,
      height: 17,
      color: option.color,
    });
    page.drawText(option.label, {
      x:
        option.x +
        (option.width - bold.widthOfTextAtSize(option.label, 5.8)) / 2,
      y: responsePanelY + 40,
      size: 5.8,
      font: bold,
      color: option.text,
    });
  });
  page.drawText("Persönlich, unverbindlich und ohne Login antworten.", {
    x: 207,
    y: responsePanelY + 19,
    size: 7,
    font: regular,
    color: rgb(0.34, 0.39, 0.45),
  });
  page.drawText("Referenz " + input.leadId, {
    x: 207,
    y: responsePanelY + 7,
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
