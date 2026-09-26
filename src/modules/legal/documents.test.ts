import { describe, expect, it } from "vitest";
import {
  createStructuredLegalDocuments,
  createPlatformTerms,
  createPlatformTermsDraft,
  createLegalDrafts,
  defaultLegalModules,
  parseLegalProfileForm,
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
    expect(documents.privacy).toContain("lokal auf unserem Server");
    expect(documents.privacy).toContain("Stadt, Region und Land");
    expect(documents.privacy).toContain("weder in der Statistik gespeichert");
    expect(documents.privacy).toContain("nach 90 Tagen automatisch gelöscht");
    expect(documents.privacy).toContain("Nachweise werden nach 180 Tagen");
    expect(documents.privacy).not.toContain("Online-Zahlungen");
    expect(publicationWarnings("imprint", documents.imprint)).toHaveLength(0);
    expect(publicationWarnings("privacy", documents.privacy)).toHaveLength(0);
  });

  it("reads the selected legal form and optional modules from the form", () => {
    const form = new FormData();
    const values = {
      companyName: "Fahrschule Beispiel GmbH",
      legalForm: "gmbh",
      representativeName: "Erika Beispiel",
      street: "Beispielweg 1",
      postalCode: "12345",
      city: "Berlin",
      country: "Deutschland",
      email: "kontakt@example.invalid",
      phone: "030 123456",
      registerType: "none",
      registerCourt: "",
      registerNumber: "",
      vatId: "",
      supervisoryAuthority: "",
      editorialResponsible: "",
      privacyContactEmail: "datenschutz@example.invalid",
      dataProtectionOfficerEmail: "",
      hostingProvider: "Beispiel Hosting GmbH",
      inquiryRetentionMonths: "6",
    };
    for (const [key, value] of Object.entries(values)) form.set(key, value);
    form.set("module_contactForm", "on");
    form.set("module_maps", "on");
    form.set("module_marketing", "on");

    const profile = parseLegalProfileForm(form);

    expect(profile.data.legalForm).toBe("gmbh");
    expect(profile.modules).toMatchObject({
      contactForm: true,
      maps: true,
      marketing: true,
      analytics: false,
      payments: false,
    });
  });

  it("adds postal acquisition only to the platform privacy draft", () => {
    const data = {
      companyName: "ENJO MEDIA",
      legalForm: "individual" as const,
      representativeName: "Erika Beispiel",
      street: "Beispielweg 1",
      postalCode: "12345",
      city: "Berlin",
      country: "Deutschland",
      email: "kontakt@example.invalid",
      phone: "",
      registerType: "none" as const,
      registerCourt: "",
      registerNumber: "",
      vatId: "",
      regulatedActivity: false,
      supervisoryAuthority: "",
      journalisticContent: false,
      editorialResponsible: "",
      privacyContactEmail: "datenschutz@example.invalid",
      dataProtectionOfficerRequired: false,
      dataProtectionOfficerEmail: "",
      hostingProvider: "Beispiel Hosting GmbH",
      inquiryRetentionMonths: 6 as const,
    };
    const platform = createStructuredLegalDocuments({
      data,
      modules: defaultLegalModules,
      platformPostalAcquisition: true,
    });
    const tenant = createStructuredLegalDocuments({
      data,
      modules: defaultLegalModules,
    });

    expect(platform.privacy).toContain("Postalische Akquise");
    expect(platform.privacy).toContain("letterei.de Postdienste GmbH");
    expect(platform.privacy).toContain("Art. 28 DSGVO");
    expect(platform.privacy).toContain("Newsletter und Produktinformationen");
    expect(platform.privacy).toContain("Art. 6 Abs. 1 lit. a DSGVO");
    expect(tenant.privacy).not.toContain("Postalische Akquise");
    expect(createPlatformTermsDraft(data)).toContain("[Festlegen:");
    const liveTerms = createPlatformTerms(data);
    expect(liveTerms).not.toContain("[Festlegen:");
    expect(liveTerms).toContain(
      "Zahlungsintervall und Laufzeit sind voneinander unabhängig",
    );
    expect(liveTerms).toContain("auf unbestimmte Zeit weiter");
    expect(liveTerms).toContain("einer Frist von einem Monat");
    expect(publicationWarnings("terms", liveTerms)).toHaveLength(0);
    expect(liveTerms).toContain("Ein Vertrag kommt durch Annahme");
    expect(createPlatformTermsDraft(data)).toContain(
      "Unternehmern im Sinne des § 14 BGB",
    );
    expect(createPlatformTermsDraft(data)).toContain(
      "Verantwortung für Inhalte und Rechte",
    );
    expect(createPlatformTermsDraft(data)).toContain(
      "wesentlichen Vertragspflicht",
    );
  });
});
