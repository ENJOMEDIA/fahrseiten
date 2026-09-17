import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MaintenancePage } from "./maintenance-page";

describe("MaintenancePage", () => {
  it("renders a noindex tenant preview with the configured message", () => {
    render(
      <MaintenancePage
        accentColor="#0f172a"
        brandName="Fahrschule Beispiel"
        message="Unsere neue Website ist bald für dich da."
        primaryColor="#0891b2"
        variant="tenant"
      />,
    );

    expect(screen.getAllByText("Fahrschule Beispiel")).toHaveLength(2);
    expect(
      screen.getByText("Unsere neue Website ist bald für dich da."),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Vorschau" })).toBeVisible();
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
  });
});
