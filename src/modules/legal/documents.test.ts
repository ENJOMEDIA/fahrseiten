import { describe, expect, it } from "vitest";
import {
  createStructuredLegalDocuments,
  createLegalDrafts,
  defaultLegalModules,
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

  it("generates fixed legal sections from structured data and active modules", () => {
    const documents = createStructuredLegalDocuments({
      data: {
        companyName: "Fahrschule Beispiel GmbH",
        legalForm: "gmbh",
        representativeName: "Erika Beispiel",
        street: "Beispielweg 1",
        postalCode: "12345",
        city: "Berlin",
        country: "Deutschland",
        email: "kontakt@example.invalid",
        phone: "030 123456",
        registerType: "commercial",
        registerCourt: "Amtsgericht Berlin",
        registerNumber: "HRB 12345",
        vatId: "DE123456789",
        regulatedActivity: true,
        supervisoryAuthority: "Beispielbehörde",
        journalisticContent: false,
        editorialResponsible: "",
        privacyContactEmail: "datenschutz@example.invalid",
        dataProtectionOfficerRequired: false,
        dataProtectionOfficerEmail: "",
        hostingProvider: "Beispiel Hosting GmbH",
        inquiryRetentionMonths: 6,
      },
      modules: { ...defaultLegalModules, maps: true, analytics: true },
    });

    expect(documents.imprint).toContain("HRB 12345");
    expect(documents.imprint).toContain("Beispielbehörde");
    expect(documents.imprint).toContain("Anschrift\nBeispielweg 1");
    expect(documents.privacy).toContain("Anschrift\nBeispielweg 1");
    expect(documents.privacy).toContain("Kartendienste");
    expect(documents.privacy).toContain("Reichweitenmessung");
    expect(documents.privacy).not.toContain("Online-Zahlungen");
    expect(publicationWarnings("imprint", documents.imprint)).toHaveLength(0);
    expect(publicationWarnings("privacy", documents.privacy)).toHaveLength(0);
  });
});
