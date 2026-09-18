import { describe, expect, it } from "vitest";

import { hasValidCronBearer, hasValidCronUrlToken } from "./cron-auth";

const token = "a-dedicated-random-trigger-token-123456";

describe("cron authentication", () => {
  it("accepts only the configured bearer secret", () => {
    expect(
      hasValidCronBearer(
        new Request("https://fahrseiten.de/api/cron", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        token,
      ),
    ).toBe(true);
    expect(
      hasValidCronBearer(
        new Request("https://fahrseiten.de/api/cron", {
          headers: { Authorization: "Bearer wrong" },
        }),
        token,
      ),
    ).toBe(false);
  });

  it("accepts the separate URL token for restricted Plesk schedulers", () => {
    expect(
      hasValidCronUrlToken(
        new Request(`https://fahrseiten.de/api/cron?token=${token}`),
        token,
      ),
    ).toBe(true);
    expect(
      hasValidCronUrlToken(
        new Request("https://fahrseiten.de/api/cron?token=wrong"),
        token,
      ),
    ).toBe(false);
  });

  it("rejects missing configuration", () => {
    const request = new Request(
      `https://fahrseiten.de/api/cron?token=${token}`,
    );
    expect(hasValidCronUrlToken(request)).toBe(false);
    expect(hasValidCronBearer(request)).toBe(false);
  });
});
