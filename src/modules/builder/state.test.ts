import { describe, expect, it } from "vitest";
import type { StoredBlock } from "@/modules/cms/block-schema";
import { duplicateBlock, moveBlock, validateDraft } from "./state";

const blocks: StoredBlock[] = [
  {
    id: "a",
    schemaVersion: 1,
    position: 0,
    visible: true,
    properties: { type: "hero", heading: "A", text: "Text" },
  },
  {
    id: "b",
    schemaVersion: 1,
    position: 1,
    visible: true,
    properties: {
      type: "cta",
      heading: "B",
      text: "Text",
      actionLabel: "Los",
      actionHref: "/",
    },
  },
];
describe("builder state", () => {
  it("moves blocks with stable positions", () =>
    expect(
      moveBlock(blocks, "b", -1).map((item) => [item.id, item.position]),
    ).toEqual([
      ["b", 0],
      ["a", 1],
    ]));
  it("duplicates blocks without sharing identity", () =>
    expect(duplicateBlock(blocks, "a", "copy").map((item) => item.id)).toEqual([
      "a",
      "copy",
      "b",
    ]));
  it("prevents publishing invalid drafts", () =>
    expect(() =>
      validateDraft([
        { ...blocks[0], properties: { ...blocks[0].properties, heading: "" } },
      ]),
    ).toThrow());
});
