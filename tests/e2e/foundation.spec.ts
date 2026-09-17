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
