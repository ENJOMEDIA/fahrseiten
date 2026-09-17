import { describe, expect, it } from "vitest";
import {
  CONSENT_VERSION,
  mayLoadOptional,
  necessaryOnly,
  parseConsentCookie,
  serializeConsent,
} from "./model";

describe("consent control", () => {
  it("blocks every optional category without valid consent", () => {
    expect(mayLoadOptional(null, "functional")).toBe(false);
    expect(mayLoadOptional(null, "statistics")).toBe(false);
    expect(mayLoadOptional(null, "marketing")).toBe(false);
  });

  it("round-trips the current version and invalidates older notices", () => {
    const state = {
      version: CONSENT_VERSION,
      choices: { ...necessaryOnly, functional: true },
      savedAt: new Date().toISOString(),
    } as const;
    expect(parseConsentCookie(serializeConsent(state))).toEqual(state);
    expect(
      parseConsentCookie(
        encodeURIComponent(JSON.stringify({ ...state, version: "old-v0" })),
      ),
    ).toBeNull();
  });
});
