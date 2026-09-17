import { describe, expect, it } from "vitest";

import { resolveDashboardUrl } from "./dashboard-url";

describe("resolveDashboardUrl", () => {
  it("uses the current host while no dashboard host is configured", () => {
    expect(resolveDashboardUrl(undefined)).toBe("/login");
  });

  it("can switch all entry links to a later app subdomain", () => {
    expect(resolveDashboardUrl("https://app.fahrseiten.de", "/login")).toBe(
      "https://app.fahrseiten.de/login",
    );
  });
});
