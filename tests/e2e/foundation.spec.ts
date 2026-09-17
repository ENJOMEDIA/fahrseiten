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
