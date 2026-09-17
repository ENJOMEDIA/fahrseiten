import { expect, test } from "@playwright/test";

test("renders the local marketing foundation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Fundament",
  );
  await expect(
    page.getByRole("navigation", { name: "Lokale Bereiche" }),
  ).toBeVisible();
});

test("protects admin areas and exposes accessible login fields", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel("E-Mail-Adresse")).toBeVisible();
  await expect(page.getByLabel("Passwort")).toHaveAttribute("type", "password");
});

test("navigates the validated demo page tree", async ({ page }) => {
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { level: 1, name: /Sicher ans Ziel/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Über uns" }).click();
  await expect(page).toHaveURL(/\/demo\/ueber-uns$/);
  await expect(
    page.getByRole("heading", { name: "Lernen mit Ruhe und Struktur" }),
  ).toBeVisible();
});

test("edits, previews, publishes and restores in the controlled builder", async ({
  page,
}) => {
  await page.goto("/builder-demo");
  await expect(
    page.getByRole("heading", { name: "Website-Builder" }),
  ).toBeVisible();
  const heading = page.getByLabel("Überschrift").first();
  await heading.fill("Sicher und entspannt zum Führerschein");
  await expect(page.getByText("Entwurf gespeichert")).toBeVisible();
  await page.getByRole("button", { name: "mobile" }).click();
  await expect(page.getByRole("button", { name: "mobile" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "Veröffentlichen" }).click();
  await expect(
    page.getByText("Seite erfolgreich veröffentlicht."),
  ).toBeVisible();
  await heading.fill("Neuer Entwurf");
  await page
    .getByRole("button", { name: "Version 1 wiederherstellen" })
    .click();
  await expect(heading).toHaveValue("Sicher und entspannt zum Führerschein");
});
