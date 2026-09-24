import { describe, expect, it } from "vitest";

import { isApplicationPath } from "./proxy";

describe("tenant domain application routes", () => {
  it.each([
    "/login",
    "/passwort-vergessen",
    "/passwort-zuruecksetzen/token",
    "/kunde",
    "/kunde/rechtliches",
    "/admin/mandanten",
  ])("keeps %s in the application", (pathname) => {
    expect(isApplicationPath(pathname)).toBe(true);
  });

  it.each(["/", "/preise", "/login-info", "/kundendienst"])(
    "keeps %s in the public tenant website",
    (pathname) => {
      expect(isApplicationPath(pathname)).toBe(false);
    },
  );
});
