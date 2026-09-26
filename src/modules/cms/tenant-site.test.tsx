import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TenantSite, resolveTenantContactHref } from "./tenant-site";
import { demoWebsite, findDemoPage } from "./demo-content";
import type { PublishedPage, TenantWebsite } from "./types";

const website: TenantWebsite = {
  tenantId: "tenant-1",
  name: "Fahrschule Beispiel",
  maintenanceMode: false,
  maintenanceMessage: "",
  navigation: [{ id: "home", label: "Start", href: "/", position: 0 }],
  theme: {
    primaryColor: "#0891b2",
    accentColor: "#0f172a",
  },
};

const page: PublishedPage = {
  tenantId: "tenant-1",
  slug: "",
  title: "Start",
  version: 1,
  seo: { noIndex: false },
  blocks: [
    {
      id: "hero",
      schemaVersion: 1,
      position: 0,
      visible: true,
      properties: {
        type: "hero",
        heading: "Sicher ans Ziel",
        text: "Persönliche Ausbildung.",
        actionLabel: "Kontakt aufnehmen",
        actionHref: "/kontakt",
      },
    },
    {
      id: "contact",
      schemaVersion: 1,
      position: 1,
      visible: true,
      properties: {
        type: "contact_teaser",
        heading: "Wir sind für dich da",
        text: "Sprich mit uns.",
      },
    },
  ],
};

describe("TenantSite contact link", () => {
  it("uses the contact area on the homepage when no contact page exists", () => {
    expect(resolveTenantContactHref(website)).toBe("/#kontakt");

    const { container } = render(<TenantSite page={page} website={website} />);

    expect(
      screen.getByRole("link", { name: "Jetzt anfragen" }),
    ).toHaveAttribute("href", "/#kontakt");
    expect(
      screen.getByRole("link", { name: "Kontakt aufnehmen" }),
    ).toHaveAttribute("href", "/#kontakt");
    expect(container.querySelector("#kontakt")).toBeInTheDocument();
  });

  it("prefers a published contact item from the navigation", () => {
    expect(
      resolveTenantContactHref({
        ...website,
        navigation: [
          ...website.navigation,
          {
            id: "contact",
            label: "Kontakt & Anfahrt",
            href: "/kontakt",
            position: 1,
          },
        ],
      }),
    ).toBe("/kontakt");
  });

  it("marks light Urban Drive labels with contrast-safe theme hooks", () => {
    const aboutPage = findDemoPage("ueber-uns");
    expect(aboutPage).not.toBeNull();
    render(<TenantSite page={aboutPage!} website={demoWebsite} />);

    expect(screen.getByText("Automatik")).toHaveClass("tenant-chip");
    expect(screen.getByText("Menschen mit Geduld")).toHaveClass(
      "tenant-section-eyebrow",
    );
  });

  it("keeps the fiktive hero rating readable in Urban Drive", () => {
    const homePage = findDemoPage("");
    expect(homePage).not.toBeNull();
    const { container } = render(
      <TenantSite page={homePage!} website={demoWebsite} />,
    );

    expect(container.querySelector(".tenant-rating-card")).toHaveTextContent(
      "fiktive Beispielbewertung",
    );
  });
});
