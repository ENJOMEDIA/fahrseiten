import { describe, expect, it } from "vitest";

import { requirePostalSendConfirmation } from "./send-confirmation";

describe("OnlineBrief24-Versandbestätigung", () => {
  it("blockiert eine Übertragung ohne ausdrückliche Bestätigung", () => {
    expect(() => requirePostalSendConfirmation(false)).toThrow(
      "Empfänger, Anschrift und PDF geprüft",
    );
  });

  it("akzeptiert den gesetzten Pflicht-Haken", () => {
    expect(() => requirePostalSendConfirmation(true)).not.toThrow();
  });
});
