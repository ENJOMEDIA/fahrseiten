import { describe, expect, it } from "vitest";

import { createBuilderBlockProperties } from "./block-catalog";

describe("builder block defaults", () => {
  it("creates a useful contact teaser instead of placeholder copy", () => {
    const properties = createBuilderBlockProperties("contact_teaser");

    expect(properties.type).toBe("contact_teaser");
    if (properties.type !== "contact_teaser") return;
    expect(properties.heading).toContain("Führerschein");
    expect(properties.text.length).toBeGreaterThan(80);
    expect(properties.text).not.toContain("Wir helfen gern");
  });

  it("returns an independent copy for every new block", () => {
    const first = createBuilderBlockProperties("benefits");
    const second = createBuilderBlockProperties("benefits");
    if (first.type !== "benefits" || second.type !== "benefits") return;

    first.items[0].title = "Geändert";
    expect(second.items[0].title).toBe("Vorteil");
  });
});
