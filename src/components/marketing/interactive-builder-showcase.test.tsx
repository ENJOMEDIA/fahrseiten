import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { InteractiveBuilderShowcase } from "./interactive-builder-showcase";

describe("InteractiveBuilderShowcase", () => {
  it("reorders and hides the selected block in the live preview", async () => {
    const user = userEvent.setup();
    render(<InteractiveBuilderShowcase />);

    const preview = screen.getByLabelText(
      "Live-Vorschau der sichtbaren Blöcke",
    );
    expect(
      within(preview).getByText("Willkommen bei deiner Fahrschule"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Führerscheinklassen/i }),
    );
    await user.click(
      screen.getByRole("button", {
        name: "Ausgewählten Block nach oben verschieben",
      }),
    );
    expect(preview.textContent?.indexOf("Führerscheinklassen")).toBeLessThan(
      preview.textContent?.indexOf("Einstieg") ?? 0,
    );

    await user.click(screen.getByRole("button", { name: "Ausblenden" }));
    expect(
      within(preview).queryByText("Dein Weg zum Führerschein"),
    ).not.toBeInTheDocument();
  });
});
