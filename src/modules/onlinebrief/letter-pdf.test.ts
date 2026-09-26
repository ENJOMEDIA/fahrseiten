import { PDFDocument } from "pdf-lib";
import { describe, expect, it, vi } from "vitest";

vi.mock("qrcode", () => ({
  default: {
    toBuffer: vi.fn(async () =>
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "base64",
      ),
    ),
  },
}));

import { createAcquisitionLetterPdf, parseLetterBody } from "./letter-pdf";

describe("Akquisebrief-Formatierung", () => {
  it("erkennt Nutzenpunkte auch ohne zusätzliche Leerzeile", () => {
    expect(
      parseLetterBody(
        "Ein kurzer Einstieg.\n• Inhalte selbst pflegen\n• Modern auftreten\n\nJetzt ansehen.",
      ),
    ).toEqual([
      { type: "paragraph", text: "Ein kurzer Einstieg." },
      {
        type: "bullets",
        items: ["Inhalte selbst pflegen", "Modern auftreten"],
      },
      { type: "paragraph", text: "Jetzt ansehen." },
    ]);
  });

  it("unterstützt klar markierte Zwischenüberschriften", () => {
    expect(
      parseLetterBody("## Das bringt FahrSeiten\nEinfach erklärt."),
    ).toEqual([
      { type: "heading", text: "Das bringt FahrSeiten" },
      { type: "paragraph", text: "Einfach erklärt." },
    ]);
  });

  it("erzeugt den vollständigen Akquisebrief auf genau einer A4-Seite", async () => {
    const bytes = await createAcquisitionLetterPdf({
      createdAt: new Date("2026-09-26T10:00:00Z"),
      kicker: "WENIGER PFLEGE. MEHR ZEIT FÜRS FAHREN.",
      headline: "Ihre Website sollte mitfahren - nicht aufhalten.",
      bodyText:
        "Ein kurzer Einstieg.\n\n## Was sofort leichter wird\n• Inhalte selbst aktualisieren\n• Fahrzeuge hochwertig zeigen\n\nJetzt persönlich ansehen.",
      leadId: "8ed5caf5-1e49-42fe-a850-8ecea4dce36f",
      campaignUrl:
        "https://fahrseiten.de/brief/8ed5caf5-1e49-42fe-a850-8ecea4dce36f/token",
      recipient: {
        companyName: "Fahrschule Beispiel GmbH",
        contactName: "Erika Beispiel",
        street: "Beispielweg 1",
        postalCode: "12345",
        city: "Musterstadt",
        country: "Deutschland",
      },
      sender: {
        companyName: "ENJO MEDIA",
        representativeName: "Enrico Vogt",
        street: "Beispielweg 2",
        postalCode: "12345",
        city: "Musterstadt",
        email: "info@example.invalid",
      },
    });
    const document = await PDFDocument.load(bytes);

    expect(document.getPageCount()).toBe(1);
    expect(document.getPage(0).getSize()).toEqual({
      width: 595.28,
      height: 841.89,
    });
  });
});
