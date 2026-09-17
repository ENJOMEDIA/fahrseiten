import { describe, expect, it } from "vitest";

import { assertTenantRows, courseSchema, moneySchema } from "./schemas";

describe("driving school content", () => {
  it("keeps prices as exact decimal strings", () => {
    expect(moneySchema.parse("499.00")).toBe("499.00");
    expect(() => moneySchema.parse(499.001)).toThrow();
  });

  it("requires offset-aware course dates", () => {
    expect(() =>
      courseSchema.parse({
        id: "c",
        position: 0,
        active: true,
        title: "Theorie",
        description: "",
        dates: [
          {
            id: "d",
            startsAt: "2026-10-01T18:00:00",
            endsAt: "2026-10-01T19:30:00",
            timezone: "Europe/Berlin",
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects rows from another tenant", () => {
    expect(() =>
      assertTenantRows("tenant-a", [{ tenantId: "tenant-b" }]),
    ).toThrow(/Tenantübergreifende/);
  });
});
