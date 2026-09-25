import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin" }));
vi.mock("@/modules/auth/actions", () => ({ logoutAction: vi.fn() }));
vi.mock("@/components/forms/auto-save", () => ({
  AutoSaveIndicator: () => null,
}));

import { AppShell } from "./app-shell";

describe("AppShell desktop navigation", () => {
  beforeEach(() => window.localStorage.clear());

  it("hides the sidebar on request and remembers the choice", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AppShell
        eyebrow="Plattform"
        navigation={[{ href: "/admin", label: "Übersicht" }]}
        title="Testkonto"
      >
        Inhalt
      </AppShell>,
    );

    await user.click(
      screen.getByRole("button", { name: "Seitenmenü ausblenden" }),
    );

    expect(container.querySelector(".app-sidebar")).not.toHaveClass("lg:flex");
    expect(window.localStorage.getItem("fahrseiten:sidebar-hidden")).toBe(
      "true",
    );
    expect(
      screen.getByRole("button", { name: "Seitenmenü einblenden" }),
    ).toBeVisible();

    await waitFor(() => expect(screen.getByText("Inhalt")).toBeVisible());
  });
});
