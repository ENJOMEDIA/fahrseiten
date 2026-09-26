import { describe, expect, it } from "vitest";

import { newsletterRecipientBlockReason } from "./newsletter-policy";

describe("newsletter recipient policy", () => {
  const eligible = {
    email: "kontakt@example.invalid",
    emailPermission: "consent",
    emailPermissionEvidence: "Double-Opt-in am 26.09.2026",
    emailOptOutAt: null,
  };

  it("accepts a documented explicit consent", () => {
    expect(newsletterRecipientBlockReason(eligible)).toBeNull();
  });

  it("does not treat an existing customer relationship as newsletter consent", () => {
    expect(
      newsletterRecipientBlockReason({
        ...eligible,
        emailPermission: "existing_customer",
      }),
    ).toMatch(/Einwilligung/);
  });

  it("blocks a recipient after opt-out", () => {
    expect(
      newsletterRecipientBlockReason({
        ...eligible,
        emailOptOutAt: new Date("2026-09-26T10:00:00Z"),
      }),
    ).toMatch(/abgemeldet/);
  });
});
