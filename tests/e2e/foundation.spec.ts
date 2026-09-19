import { expect, test } from "@playwright/test";

async function keepNecessaryConsent(page: import("@playwright/test").Page) {
  const button = page.getByRole("button", { name: "Nur notwendige" });
  if (await button.isVisible()) await button.click();
}

test("renders the local marketing foundation", async ({ page }) => {
  const favicon = await page.request.get("/api/favicon");
  expect(favicon.ok()).toBe(true);
  expect(favicon.headers()["content-type"]).toContain("image/svg+xml");
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Digital auf der Überholspur",
  );
  await expect(
    page.getByRole("navigation", { name: "Marketing-Navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Zum Kundenlogin" }),
  ).toHaveAttribute("href", "/login");
  await expect(
    page.getByRole("complementary", { name: "Einwilligungseinstellungen" }),
  ).toHaveCount(0);
  await keepNecessaryConsent(page);
  await page.goto("/cookie-einstellungen");
  await expect(
    page.getByText("Beispiel für externe Karte ist blockiert"),
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

test("exposes the protected setup and tenant onboarding forms", async ({
  page,
}) => {
  await page.goto("/setup");
  await expect(
    page.getByRole("heading", { name: "FahrSeiten einrichten" }),
  ).toBeVisible();
  await expect(page.getByLabel("Installationscode")).toHaveAttribute(
    "type",
    "password",
  );
  await expect(page.getByLabel("Datenbankhost oder IP-Adresse")).toBeVisible();

  await page.goto(`/onboarding/${"x".repeat(43)}`);
  await expect(
    page.getByRole("heading", { name: "Fahrschulseite vorbereiten" }),
  ).toBeVisible();
  await expect(page.getByLabel("Gewünschte Domain")).toBeVisible();
  await expect(page.getByLabel("Primärfarbe")).toHaveAttribute("type", "color");
});

test("navigates the validated demo page tree", async ({ page }) => {
  await page.goto("/demo");
  await keepNecessaryConsent(page);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Deine Fahrt\. Dein Tempo\. Dein Moment\./,
    }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Hauptnavigation" })
    .getByRole("link", { name: "Über uns" })
    .click();
  await expect(page).toHaveURL(/\/demo\/ueber-uns$/);
  await expect(
    page.getByRole("heading", { name: "Menschen, die dir etwas zutrauen." }),
  ).toBeVisible();
});

test("edits, previews, publishes and restores in the controlled builder", async ({
  page,
}) => {
  await page.goto("/builder-demo");
  await keepNecessaryConsent(page);
  await expect(
    page.getByRole("heading", { name: "Website-Builder" }),
  ).toBeVisible();
  const heading = page.getByLabel("Überschrift", { exact: true }).first();
  await heading.fill("Sicher und entspannt zum Führerschein");
  await expect(page.getByText("Entwurf gespeichert")).toBeVisible();
  await page.getByRole("button", { name: "Mobil", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Mobil", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
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

test("submits a validated local demo inquiry", async ({ page }) => {
  await page.goto("/demo/kontakt");
  await keepNecessaryConsent(page);
  await page.getByLabel("Name").fill("Alex Beispiel");
  await page.getByLabel("E-Mail").fill("alex@example.invalid");
  await page.getByLabel("Nachricht").fill("Bitte um fiktive Informationen.");
  await page
    .getByRole("checkbox", { name: /Datenschutzhinweis gelesen/ })
    .check();
  await page.waitForTimeout(2100);
  await page.getByRole("button", { name: "Testanfrage senden" }).click();
  await expect(
    page.getByText(/fiktive Testanfrage wurde gespeichert/),
  ).toBeVisible();
});

test("creates a traceable local error report", async ({ page }) => {
  await page.goto("/fehler-melden");
  await keepNecessaryConsent(page);
  await page.getByLabel("Kurztitel").fill("Lokale Vorschau bleibt leer");
  await page
    .getByLabel(/Beschreibung ohne/)
    .fill("Nach einem fiktiven Speichervorgang bleibt die Vorschau leer.");
  await page.getByRole("button", { name: "Fehlerbericht senden" }).click();
  await expect(page.getByText(/Referenz-ID: FS-/)).toBeVisible();
});

test("serves security headers and keyboard-accessible mobile navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");
  expect(response?.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  await keepNecessaryConsent(page);
  await page.getByText("Menü", { exact: true }).click();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Funktionen" })).toBeFocused();
});
