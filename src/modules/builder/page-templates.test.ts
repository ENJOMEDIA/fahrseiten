import { describe, expect, it } from "vitest";

import { createPageTemplateBlocks, normalizePageSlug } from "./page-templates";

describe("builder page templates", () => {
  it("creates meaningful sections with stable positions", () => {
    let id = 0;
    const blocks = createPageTemplateBlocks(
      "services",
      {},
      () => `block-${++id}`,
    );

    expect(blocks.map((block) => block.properties.type)).toEqual([
      "hero",
      "benefits",
      "license_classes",
      "prices",
      "cta",
    ]);
    expect(blocks.map((block) => block.position)).toEqual([0, 1, 2, 3, 4]);
    expect(blocks[1].properties.type).toBe("benefits");
    if (blocks[1].properties.type === "benefits")
      expect(blocks[1].properties.items).toHaveLength(3);
  });

  it("normalizes German page names into safe slugs", () => {
    expect(normalizePageSlug("Über uns & Schüler")).toBe("ueber-uns-schueler");
    expect(normalizePageSlug("  Preise 2027! ")).toBe("preise-2027");
  });
});
