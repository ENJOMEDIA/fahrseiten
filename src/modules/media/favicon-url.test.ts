import { describe, expect, it } from "vitest";

import { faviconMediaPath } from "./favicon-url";

describe("faviconMediaPath", () => {
  it("returns a relative path that stays on the requesting public domain", () => {
    expect(faviconMediaPath("asset-123")).toBe("/media/asset-123");
  });

  it("encodes the media identifier before using it in a redirect", () => {
    expect(faviconMediaPath("asset/test")).toBe("/media/asset%2Ftest");
  });
});
