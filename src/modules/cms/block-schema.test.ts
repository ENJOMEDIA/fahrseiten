import { describe, expect, it } from "vitest";

import { parseStoredBlocks } from "./block-schema";

describe("block schemas", () => {
  it("sorts and validates controlled blocks", () => {
    const blocks = parseStoredBlocks([
      {
        id: "b",
        schemaVersion: 1,
        position: 2,
        visible: true,
        properties: {
          type: "cta",
          heading: "Kontakt",
          text: "Melde dich",
          actionLabel: "Kontakt",
          actionHref: "/kontakt",
        },
      },
      {
        id: "a",
        schemaVersion: 1,
        position: 1,
        visible: true,
        properties: {
          type: "hero",
          heading: "Willkommen",
          text: "Sicher lernen",
        },
      },
    ]);
    expect(blocks.map((block) => block.id)).toEqual(["a", "b"]);
  });

  it("rejects executable and unknown link protocols", () => {
    expect(() =>
      parseStoredBlocks([
        {
          id: "x",
          schemaVersion: 1,
          position: 0,
          visible: true,
          properties: {
            type: "cta",
            heading: "X",
            text: "X",
            actionLabel: "X",
            actionHref: "javascript:alert(1)",
          },
        },
      ]),
    ).toThrow();
  });

  it("rejects raw HTML as an unsupported block", () => {
    expect(() =>
      parseStoredBlocks([
        {
          id: "x",
          schemaVersion: 1,
          position: 0,
          visible: true,
          properties: { type: "html", value: "<script>alert(1)</script>" },
        },
      ]),
    ).toThrow();
  });
});
