import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";
import { EmptyState } from "./feedback";
import { Input } from "./field";

describe("design system primitives", () => {
  it("keeps fields associated with their label and error", () => {
    render(<Input error="Titel fehlt" label="Seitentitel" name="title" />);
    expect(screen.getByLabelText("Seitentitel")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("Titel fehlt")).toHaveAttribute(
      "id",
      "title-description",
    );
  });

  it("supports keyboard-accessible actions", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Speichern</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Speichern" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders an understandable empty state", () => {
    render(
      <EmptyState
        description="Lege den ersten Eintrag an."
        title="Noch leer"
      />,
    );
    expect(screen.getByRole("heading", { name: "Noch leer" })).toBeVisible();
  });
});
