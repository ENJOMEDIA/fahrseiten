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
  brandLogoSurface?: "light" | "dark";
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
    y: PAGE_HEIGHT - 5,
    width: PAGE_WIDTH,
    height: 5,
    color: rgb(0.025, 0.08, 0.14),
  });
  page.drawText(input.sender.companyName, {
    x: 540 - bold.widthOfTextAtSize(input.sender.companyName, 9),
    y: 807,
    size: 9,
    font: bold,
    color: rgb(0.025, 0.08, 0.14),
  });
  const senderContact = `${input.sender.representativeName} · ${input.sender.email}`;
  page.drawText(senderContact, {
    x: 540 - regular.widthOfTextAtSize(senderContact, 7.2),
    y: 791,
    size: 7.2,
    font: regular,
    color: rgb(0.38, 0.43, 0.48),
  });
  const senderAddress = `${input.sender.street} · ${input.sender.postalCode} ${input.sender.city}`;
  page.drawText(senderAddress, {
    x: 540 - regular.widthOfTextAtSize(senderAddress, 7.2),
    y: 778,
    size: 7.2,
    font: regular,
    color: rgb(0.38, 0.43, 0.48),
  });
  page.drawLine({
    start: { x: 55, y: 755 },
    end: { x: 540, y: 755 },
    thickness: 0.6,
    color: rgb(0.85, 0.88, 0.9),
  });
  const senderLine = `${input.sender.companyName} · ${input.sender.street} · ${input.sender.postalCode} ${input.sender.city}`;
  page.drawText(senderLine, {
    x: 62,
    y: 711,
    size: 6.3,
    font: regular,
    color: rgb(0.35, 0.4, 0.47),
  });
  page.drawLine({
    start: { x: 62, y: 707 },
    end: {
      x: Math.min(270, 62 + regular.widthOfTextAtSize(senderLine, 6.3)),
      y: 707,
    },
    thickness: 0.35,
    color: rgb(0.55, 0.59, 0.64),
  });
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
      y: 687 - index * 14,
      size: 9.5,
      font: regular,
      color: rgb(0.06, 0.09, 0.14),
    }),
  );

  if (brandLogo) {
    if (input.brandLogoSurface === "dark") {
      page.drawRectangle({
        x: 49,
        y: 775,
        width: 232,
        height: 46,
        color: rgb(0.025, 0.08, 0.14),
      });
    }
    const dimensions = brandLogo.scaleToFit(210, 42);
    page.drawImage(brandLogo, {
      x: 55,
      y: 777 + (40 - dimensions.height) / 2,
      width: dimensions.width,
      height: dimensions.height,
    });
  } else {
    page.drawText("FAHRSEITEN", {
      x: 55,
      y: 797,
      size: 19,
      font: bold,
      color: rgb(0.025, 0.08, 0.14),
    });
    page.drawText("by ENJO MEDIA", {
      x: 57,
      y: 780,
      size: 7.5,
      font: bold,
      color: rgb(0.02, 0.55, 0.63),
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
  y -= 18;
  page.drawRectangle({
    x: 56,
    y: y + 4,
    width: 28,
    height: 2,
    color: rgb(0.02, 0.6, 0.68),
  });
  y -= 15;
  const headlineLines = wrapText(input.headline, bold, 20, 468);
  if (headlineLines.length > 2)
    throw new Error("Die Briefüberschrift darf höchstens zwei Zeilen belegen.");
  headlineLines.forEach((line, index) =>
    page.drawText(line, {
      x: 56,
      y: y - index * 24,
      size: 20,
      font: bold,
      color: rgb(0.025, 0.08, 0.14),
    }),
  );
  y -= headlineLines.length * 24 + 14;
  if (heroImage) {
    page.drawRectangle({
      x: 55,
      y: y - 66,
      width: 485,
      height: 66,
      color: rgb(0.94, 0.98, 0.99),
    });
    page.drawImage(heroImage, {
      x: 55,
      y: y - 66,
      width: 485,
      height: 66,
    });
    y -= 78;
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
      segment.items.forEach((item, itemIndex) => {
        const lines = wrapText(item, bold, 9.2, 414);
        const itemHeight = Math.max(22, lines.length * 12 + 7);
        const number = String(itemIndex + 1).padStart(2, "0");
        page.drawText(number, {
          x: 57,
          y: y - 4,
          size: 6.8,
          font: bold,
          color: rgb(0.02, 0.53, 0.6),
        });
        lines.forEach((item, index) =>
          page.drawText(item, {
            x: 88,
            y: y - 5 - index * 12,
            size: 9.1,
            font: regular,
            color: rgb(0.06, 0.13, 0.2),
          }),
        );
        page.drawLine({
          start: { x: 56, y: y - itemHeight + 3 },
          end: { x: 540, y: y - itemHeight + 3 },
          thickness: 0.45,
          color: rgb(0.88, 0.9, 0.92),
        });
        y -= itemHeight + 5;
      });
      y -= 3;
      return;
    }
    if (paragraphIndex === 0) {
      const lines = wrapText(segment.text, regular, 10.6, 438);
      const height = lines.length * 15 + 8;
      page.drawRectangle({
        x: 55,
        y: y - height + 8,
        width: 2,
        height: height - 2,
        color: rgb(0.02, 0.6, 0.68),
      });
      lines.forEach((line, index) =>
        page.drawText(line, {
          x: 70,
          y: y - index * 15,
          size: 10.3,
          font: regular,
          color: rgb(0.08, 0.16, 0.23),
        }),
      );
      y -= height + 9;
      paragraphIndex += 1;
      return;
    }
    drawParagraph(segment.text, { size: 9.6 });
    paragraphIndex += 1;
  });
  if (y < 225)
    throw new Error(
      "Der Brieftext ist für das einseitige Layout zu lang. Bitte kürze ihn oder entferne das Bild.",
    );

  const responsePanelY = Math.max(88, Math.min(170, y - 146));
  page.drawRectangle({
    x: 55,
    y: responsePanelY,
    width: 485,
    height: 138,
    color: rgb(0.965, 0.97, 0.975),
    borderColor: rgb(0.86, 0.89, 0.91),
    borderWidth: 0.7,
  });
  page.drawRectangle({
    x: 416,
    y: responsePanelY + 13,
    width: 110,
    height: 110,
    color: rgb(1, 1, 1),
  });
  page.drawImage(qr, {
    x: 423,
    y: responsePanelY + 20,
    width: 96,
    height: 96,
  });
  page.drawText("Ihre persönliche FahrSeiten-Auswahl", {
    x: 75,
    y: responsePanelY + 110,
    size: 12.2,
    font: bold,
    color: rgb(0.025, 0.08, 0.14),
  });
  [
    "Ein Scan zeigt Ihnen in Ruhe, was möglich ist.",
    "Antworten Sie direkt – ohne Konto und ohne Verpflichtung.",
  ].forEach((line, index) =>
    page.drawText(line, {
      x: 75,
      y: responsePanelY + 87 - index * 13,
      size: 8.1,
      font: regular,
      color: rgb(0.34, 0.39, 0.45),
    }),
  );
  const responseOptions = [
    { label: "INTERESSE", x: 75, width: 67, primary: true },
    { label: "MEHR INFOS", x: 148, width: 78, primary: false },
    { label: "KEIN INTERESSE", x: 232, width: 98, primary: false },
  ];
  responseOptions.forEach((option) => {
    page.drawRectangle({
      x: option.x,
      y: responsePanelY + 36,
      width: option.width,
      height: 17,
      color: option.primary ? rgb(0.02, 0.53, 0.6) : rgb(1, 1, 1),
      borderColor: option.primary ? rgb(0.02, 0.53, 0.6) : rgb(0.8, 0.83, 0.86),
      borderWidth: 0.5,
    });
    page.drawText(option.label, {
      x:
        option.x +
        (option.width - bold.widthOfTextAtSize(option.label, 5.8)) / 2,
      y: responsePanelY + 42,
      size: 5.8,
      font: bold,
      color: option.primary ? rgb(1, 1, 1) : rgb(0.3, 0.35, 0.4),
    });
  });
  page.drawText("Persönlich, unverbindlich und ohne Login antworten.", {
    x: 75,
    y: responsePanelY + 19,
    size: 7,
    font: regular,
    color: rgb(0.38, 0.43, 0.48),
  });
  page.drawText("Referenz " + input.leadId, {
    x: 75,
    y: responsePanelY + 7,
    size: 5.5,
    font: regular,
    color: rgb(0.58, 0.62, 0.66),
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
