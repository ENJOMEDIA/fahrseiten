import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/kunde/inhalte/[module]/actions", () => ({
  createContentEntryAction: vi.fn(async (state) => state),
  updateContentEntryAction: vi.fn(async (state) => state),
}));

import { VehicleSetupForm } from "./vehicle-setup-form";

const classes = [
  { key: "B", title: "Klasse B" },
  { key: "BE", title: "Klasse BE" },
];

describe("VehicleSetupForm", () => {
  it("requires one of the previously selected license classes", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <VehicleSetupForm classes={classes} media={[]} />,
    );

    const submit = screen.getByRole("button", {
      name: "+ Fahrzeug speichern",
    });
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: "Klasse B" }));

    expect(submit).toBeEnabled();
    expect(
      container.querySelector<HTMLInputElement>('input[name="category"]')
        ?.value,
    ).toBe("B");
  });

  it("recognizes saved class labels and offers a later photo change", () => {
    render(
      <VehicleSetupForm
        classes={classes}
        media={[{ id: "media-1", label: "Golf vor der Fahrschule" }]}
        vehicle={{
          id: "vehicle-1",
          name: "VW Golf",
          category: "Klasse B, BE",
          transmission: "manual",
          description: "Ausbildungsfahrzeug",
          imageMediaId: null,
        }}
      />,
    );

    expect(screen.getByRole("checkbox", { name: "Klasse B" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Klasse BE" })).toBeChecked();
    expect(screen.getByLabelText("Vorhandenes Foto auswählen")).toHaveValue("");
    expect(
      screen.getByLabelText(/^Oder neues Foto hochladen/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Fahrzeug aktualisieren" }),
    ).toBeEnabled();
  });
});
