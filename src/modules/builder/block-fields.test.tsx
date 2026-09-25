import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BuilderBlockFields } from "./block-fields";

describe("BuilderBlockFields", () => {
  it("edits structured benefit content", async () => {
    const onPatch = vi.fn();
    render(
      <BuilderBlockFields
        properties={{
          type: "benefits",
          heading: "Vorteile",
          items: [{ title: "Persönlich", text: "Direkte Begleitung" }],
        }}
        onPatch={onPatch}
      />,
    );

    fireEvent.change(screen.getByLabelText("Titel von Vorteil 1"), {
      target: { value: "Flexibel" },
    });

    expect(onPatch).toHaveBeenLastCalledWith({
      items: [{ title: "Flexibel", text: "Direkte Begleitung" }],
    });
  });

  it("adds a meaningful FAQ entry instead of an empty item", async () => {
    const user = userEvent.setup();
    const onPatch = vi.fn();
    render(
      <BuilderBlockFields
        properties={{
          type: "faq",
          heading: "Fragen",
          items: [{ question: "Wie starte ich?", answer: "Ruf uns an." }],
        }}
        onPatch={onPatch}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Frage hinzufügen/ }));

    expect(onPatch).toHaveBeenCalledWith({
      items: [
        { question: "Wie starte ich?", answer: "Ruf uns an." },
        {
          question: "Neue häufige Frage",
          answer: "Trage hier eine hilfreiche Antwort ein.",
        },
      ],
    });
  });
});
