import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { findPlatformSettings } from "@/modules/setup/platform-settings";

import { SimpleMarketingPage } from "./simple-page";

vi.mock("@/config/env", () => ({
  env: { DEMO_DATA_MODE: "database" },
}));
vi.mock("next/server", () => ({
  connection: vi.fn(),
}));
vi.mock("@/modules/setup/platform-settings", () => ({
  findPlatformSettings: vi.fn(),
}));

const settings = {
  maintenanceMode: true,
  maintenanceMessage: "Wir bereiten FahrSeiten für den Start vor.",
  brandName: "FahrSeiten",
  primaryColor: "#0891b2",
  accentColor: "#0f172a",
};

describe("SimpleMarketingPage maintenance gate", () => {
  beforeEach(() => {
    vi.mocked(findPlatformSettings).mockResolvedValue(settings as never);
  });

  it("replaces ordinary marketing routes with the maintenance presentation", async () => {
    render(
      await SimpleMarketingPage({
        eyebrow: "Funktionen",
        title: "Nicht während der Wartung sichtbar",
        text: "Verdeckter Marketinginhalt",
        children: <p>Interner Seiteninhalt</p>,
      }),
    );

    expect(
      screen.getByText("Wir bereiten FahrSeiten für den Start vor."),
    ).toBeVisible();
    expect(
      screen.queryByText("Nicht während der Wartung sichtbar"),
    ).not.toBeInTheDocument();
  });

  it("keeps legal pages reachable without the marketing navigation", async () => {
    render(
      await SimpleMarketingPage({
        availableDuringMaintenance: true,
        eyebrow: "Rechtliches",
        title: "Impressum",
        text: "Angaben gemäß § 5 DDG",
        children: <p>Rechtlich erforderlicher Inhalt</p>,
      }),
    );

    expect(screen.getByText("Rechtlich erforderlicher Inhalt")).toBeVisible();
    expect(screen.queryByText("Funktionen")).not.toBeInTheDocument();
    expect(screen.getByText("Im Aufbau")).toBeVisible();
  });
});
