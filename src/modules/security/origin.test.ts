import { describe, expect, it } from "vitest";
import { isTrustedMutationRequest } from "./origin";

describe("mutation origin protection", () => {
  it("accepts a matching origin and host", () => {
    expect(
      isTrustedMutationRequest(
        new Request("https://fahrseiten.de/api/test", {
          headers: {
            host: "fahrseiten.de",
            origin: "https://fahrseiten.de",
            "sec-fetch-site": "same-origin",
          },
        }),
      ),
    ).toBe(true);
  });
  it("rejects cross-site and missing origins", () => {
    expect(
      isTrustedMutationRequest(
        new Request("https://fahrseiten.de/api/test", {
          headers: {
            host: "fahrseiten.de",
            origin: "https://evil.invalid",
            "sec-fetch-site": "cross-site",
          },
        }),
      ),
    ).toBe(false);
    expect(
      isTrustedMutationRequest(
        new Request("https://fahrseiten.de/api/test", {
          headers: { host: "fahrseiten.de" },
        }),
      ),
    ).toBe(false);
  });
});
