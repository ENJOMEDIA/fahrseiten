import { describe, expect, it } from "vitest";

import { createContractSections } from "./template";

describe("contract template", () => {
  it("separates customer content responsibility from provider obligations", () => {
    const text = createContractSections({
      contractNumber: "V-2026-001",
      customerNumber: "FS-2026-001",
      provider: {
        companyName: "ENJO MEDIA",
        representativeName: "Max Beispiel",
        street: "Musterweg 1",
        postalCode: "12345",
        city: "Musterstadt",
        country: "Deutschland",
        email: "info@example.invalid",
      },
      customer: {
        companyName: "Fahrschule Beispiel",
        street: "Teststraße 2",
        postalCode: "54321",
        city: "Teststadt",
        country: "Deutschland",
        email: "kunde@example.invalid",
      },
      packageName: "Durchstarter",
      monthlyPriceCents: 9999,
      setupPriceCents: 10000,
      startsAt: new Date("2026-09-18T00:00:00Z"),
      minimumTermMonths: 12,
      cancellationNoticeMonths: 1,
      renewsIndefinitely: true,
      billingIntervalMonths: 1,
      billingAmountCents: 9999,
      discountBasisPoints: 0,
    })
      .flatMap((section) => section.paragraphs)
      .join("\n");

    expect(text).toContain("Kunde ist für die von ihm bereitgestellten");
    expect(text).toContain(
      "FahrSeiten bleibt für eigene technische Leistungen",
    );
    expect(text).toContain(
      "erforderlichen Nutzungs- und Persönlichkeitsrechte",
    );
    expect(text).toContain("Rechtebelege vorlegen");
    expect(text).toContain("von berechtigten Ansprüchen Dritter");
    expect(text).toContain("eigenständige Änderungen oder Inhalte");
    expect(text).toContain(
      "separat über das von FahrSeiten eingesetzte Rechnungssystem",
    );
    expect(text).toContain("Vorsatz, grober Fahrlässigkeit");
    expect(text).toContain("auf unbestimmte Zeit weiter");
    expect(text).toContain("Zahlungsintervall und Laufzeit");
  });
});
