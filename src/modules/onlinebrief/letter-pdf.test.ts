import { describe, expect, it } from "vitest";

import { parseLetterBody } from "./letter-pdf";

describe("Akquisebrief-Formatierung", () => {
  it("erkennt Nutzenpunkte auch ohne zusätzliche Leerzeile", () => {
    expect(
      parseLetterBody(
        "Ein kurzer Einstieg.\n• Inhalte selbst pflegen\n• Modern auftreten\n\nJetzt ansehen.",
      ),
    ).toEqual([
      { type: "paragraph", text: "Ein kurzer Einstieg." },
      {
        type: "bullets",
        items: ["Inhalte selbst pflegen", "Modern auftreten"],
      },
      { type: "paragraph", text: "Jetzt ansehen." },
    ]);
  });

  it("unterstützt klar markierte Zwischenüberschriften", () => {
    expect(
      parseLetterBody("## Das bringt FahrSeiten\nEinfach erklärt."),
    ).toEqual([
      { type: "heading", text: "Das bringt FahrSeiten" },
      { type: "paragraph", text: "Einfach erklärt." },
    ]);
  });
});
