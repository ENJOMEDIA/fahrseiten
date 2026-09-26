import { describe, expect, it } from "vitest";

import { clientIpFromHeader } from "./client-ip";

describe("Analytics-IP-Header", () => {
  it("bleibt ohne ausdrücklich konfigurierten Header deaktiviert", () => {
    expect(
      clientIpFromHeader(new Headers({ "x-real-ip": "203.0.113.9" }), "none"),
    ).toBeNull();
  });

  it("liest eine gültige erste Proxy-Adresse", () => {
    expect(
      clientIpFromHeader(
        new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.2" }),
        "x-forwarded-for",
      ),
    ).toBe("203.0.113.9");
  });

  it("verwirft ungültige Headerwerte", () => {
    expect(
      clientIpFromHeader(
        new Headers({ "x-real-ip": "keine-ip-adresse" }),
        "x-real-ip",
      ),
    ).toBeNull();
  });
});
