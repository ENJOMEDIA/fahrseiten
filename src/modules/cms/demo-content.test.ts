import { describe, expect, it } from "vitest";

import { demoPages, demoWebsite, findDemoPage } from "./demo-content";

describe("FahrSeiten-Demo", () => {
  it("verlinkt jede öffentliche Hauptseite auf eine vorhandene Seite", () => {
    for (const item of demoWebsite.navigation) {
      const slug = item.href.replace(/^\/demo\/?/, "");
      expect(findDemoPage(slug), item.href).not.toBeNull();
    }
  });

  it("zeigt jeden im kontrollierten Builder verfügbaren Blocktyp", () => {
    const renderedTypes = new Set(
      demoPages.flatMap((page) =>
        page.blocks.map((block) => block.properties.type),
      ),
    );

    expect(renderedTypes).toEqual(
      new Set([
        "hero",
        "text_image",
        "benefits",
        "cta",
        "faq",
        "contact_teaser",
        "license_classes",
        "prices",
        "courses",
        "team",
        "fleet",
        "locations",
        "testimonials",
      ]),
    );
  });

  it("kennzeichnet sämtliche Demo-Seiten für Suchmaschinen als Vorschau", () => {
    expect(demoPages.every((page) => page.seo.noIndex)).toBe(true);
  });
});
