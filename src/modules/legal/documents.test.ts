import { describe, expect, it } from "vitest";
import {
  createLegalDrafts,
  publicationWarnings,
  validateLegalPublication,
} from "./documents";

describe("legal document publication", () => {
  it("warns before an incomplete tenant imprint is published", () => {
    expect(publicationWarnings("imprint", "Nur ein Name")).toHaveLength(3);
    expect(() =>
      validateLegalPublication({
        type: "imprint",
        version: 1,
        warningAcknowledged: true,
        content:
          "Ein langer, aber unvollständiger Entwurf ohne die notwendigen Bereiche. ".repeat(
            3,
          ),
      }),
    ).toThrow(/Pflichtbereich/);
  });

  it("creates editable legal drafts from onboarding data", () => {
    const drafts = createLegalDrafts({
      companyName: "Fahrschule Beispiel",
      ownerName: "Erika Beispiel",
      email: "kontakt@example.invalid",
      street: "Beispielweg 1",
      postalCode: "12345",
      city: "Berlin",
      hostingProvider: "Beispiel Hosting GmbH",
    });
    expect(drafts.imprint).toContain("Fahrschule Beispiel");
    expect(drafts.imprint).toContain("[nicht angegeben – rechtlich prüfen]");
    expect(drafts.privacy).toContain("Beispiel Hosting GmbH");
  });
});
