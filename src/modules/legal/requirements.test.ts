import { describe, expect, it } from "vitest";

import type { LegalModuleSettings } from "@/db/schema";
import { featureCatalog } from "@/modules/features/catalog";

import { findMissingRequiredLegalModules } from "./requirements";

const modules: LegalModuleSettings = {
  contactForm: true,
  emailDelivery: true,
  consentManagement: true,
  maps: false,
  analytics: false,
  marketing: false,
  video: false,
  messaging: false,
  onlineBooking: false,
  payments: false,
};

describe("tenant legal feature effects", () => {
  it("marks a newly required legal module for review", () => {
    expect(
      findMissingRequiredLegalModules(modules, [
        "contactForm",
        "analytics",
        "payments",
      ]),
    ).toEqual(["analytics", "payments"]);
  });

  it("requires every feature to declare privacy and tenant terms effects", () => {
    for (const feature of Object.values(featureCatalog)) {
      expect(Array.isArray(feature.legalModules)).toBe(true);
      expect(typeof feature.tenantTermsRequired).toBe("boolean");
    }
    expect(featureCatalog.analytics.legalModules).toContain("analytics");
    expect(featureCatalog.payments.tenantTermsRequired).toBe(true);
    expect(featureCatalog.lesson_booking.tenantTermsRequired).toBe(true);
  });
});
