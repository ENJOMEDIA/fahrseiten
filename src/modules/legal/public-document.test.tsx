import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LegalContent } from "./public-document";

describe("LegalContent", () => {
  it("turns structured legal text into readable sections", () => {
    render(
      <LegalContent
        title="Datenschutz"
        content={`Datenschutzerklärung

1. Verantwortlicher
ENJO MEDIA
E-Mail: datenschutz@example.invalid

2. Hosting und Server-Protokolle
Beim Aufruf werden technisch erforderliche Verbindungsdaten verarbeitet.`}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "1. Verantwortlicher" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "2. Hosting und Server-Protokolle",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Datenschutzerklärung")).not.toBeInTheDocument();
    expect(screen.getByText("E-Mail:")).toHaveClass("font-semibold");
  });

  it("renders the legal imprint basis as a compact notice", () => {
    render(
      <LegalContent
        title="Impressum"
        content={`Impressum

Angaben gemäß § 5 DDG und § 18 Abs. 1 MStV

Anbieter
ENJO MEDIA`}
      />,
    );

    expect(screen.getByText(/Angaben gemäß § 5 DDG/)).toHaveClass(
      "text-cyan-950",
    );
    expect(
      screen.getByRole("heading", { name: "Anbieter" }),
    ).toBeInTheDocument();
  });
});
