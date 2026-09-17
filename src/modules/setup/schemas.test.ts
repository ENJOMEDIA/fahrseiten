import { describe, expect, it } from "vitest";

import { platformSetupSchema, tenantOnboardingSchema } from "./schemas";

describe("setup schemas", () => {
  it("normalizes a complete platform setup", () => {
    const result = platformSetupSchema.parse({
      installToken: "x".repeat(32),
      databaseHost: "db.internal",
      databasePort: "3306",
      databaseName: "fahrseiten_prod",
      databaseUser: "fahrseiten_user",
      databasePassword: "database-password",
      brandName: "FahrSeiten",
      companyName: "ENJO MEDIA",
      ownerName: "Erika Beispiel",
      email: "Owner@FahrSeiten.de",
      password: "Sicheres-Passwort-2026!",
      street: "Beispielweg 1",
      postalCode: "12345",
      city: "Berlin",
      primaryColor: "#0891b2",
      accentColor: "#0f172a",
      maintenanceMessage: "Unsere neue Plattform entsteht gerade.",
      hostingProvider: "Beispiel Hosting GmbH",
    });
    expect(result.email).toBe("owner@fahrseiten.de");
    expect(result.databasePort).toBe(3306);
  });

  it("rejects incomplete tenant data and invalid colors", () => {
    expect(() =>
      tenantOnboardingSchema.parse({
        token: "x".repeat(32),
        companyName: "Fahrschule Beispiel",
        primaryColor: "cyan",
      }),
    ).toThrow();
  });
});
