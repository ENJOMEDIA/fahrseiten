import { describe, expect, it } from "vitest";

import {
  publishDraft,
  restoreVersion,
  type PageAggregate,
} from "./publication";

const page: PageAggregate = {
  id: "page-1",
  tenantId: "tenant-a",
  slug: "",
  publishedVersionId: "version-1",
  versions: [
    {
      id: "version-1",
      version: 1,
      state: "published",
      title: "Alt",
      blocks: [],
    },
    {
      id: "version-2",
      version: 2,
      state: "draft",
      title: "Neu",
      blocks: [
        {
          id: "hero",
          schemaVersion: 1,
          position: 0,
          visible: true,
          properties: { type: "hero", heading: "Neu", text: "Text" },
        },
      ],
    },
  ],
};

describe("page publication", () => {
  it("publishes a validated draft and archives the previous publication", () => {
    const result = publishDraft(page, "version-2");
    expect(result.publishedVersionId).toBe("version-2");
    expect(result.versions.find((item) => item.id === "version-1")?.state).toBe(
      "archived",
    );
  });

  it("restores an immutable copy as a new draft", () => {
    const result = restoreVersion(page, "version-1", "version-3");
    expect(result.versions.at(-1)).toMatchObject({
      id: "version-3",
      version: 3,
      state: "draft",
      title: "Alt",
    });
    expect(result.publishedVersionId).toBe("version-1");
  });

  it("does not publish a version from another page", () => {
    expect(() => publishDraft(page, "foreign-version")).toThrow(/gehört nicht/);
  });
});
