import { describe, expect, it } from "vitest";
import { publicationWarnings, validateLegalPublication } from "./documents";

describe("legal document publication", () => {
  it("warns before an incomplete tenant imprint is published", () => {
    expect(publicationWarnings("imprint", "Nur ein Name")).toHaveLength(3);
    expect(() =>
      validateLegalPublication({
        type: "imprint",
        version: 1,
        warningAcknowledged: true,
        content:
          "Ein langer, aber unvollständiger Entwurf ohne die notwendigen Bereiche. ".repeat(
            3,
          ),
      }),
    ).toThrow(/Pflichtbereich/);
  });
});
