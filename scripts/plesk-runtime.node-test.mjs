import assert from "node:assert/strict";
import { test } from "node:test";

import { validateProductionEnvironment } from "../deploy/plesk/validate-env.mjs";

const validEnvironment = {
  NODE_ENV: "production",
  APP_BASE_URL: "https://fahrseiten.de",
  DATABASE_URL: "mysql://fahrseiten:secret@db.internal:3306/fahrseiten",
  DEMO_DATA_MODE: "database",
  MARKETING_HOSTS: "fahrseiten.de,www.fahrseiten.de",
  APP_HOSTS: "app.fahrseiten.de",
  CRON_SECRET: "a-random-secret-with-32-characters",
  SMTP_MODE: "smtp",
  SMTP_FROM: "FahrSeiten <noreply@fahrseiten.de>",
};

test("accepts a complete production environment", () => {
  assert.deepEqual(validateProductionEnvironment(validEnvironment), []);
});

test("rejects local defaults and missing production settings", () => {
  const errors = validateProductionEnvironment({
    ...validEnvironment,
    APP_BASE_URL: "http://localhost:3000",
    DATABASE_URL:
      "mysql://fahrseiten_local:local_only@127.0.0.1:3306/fahrseiten_local",
    DEMO_DATA_MODE: "fixture",
    CRON_SECRET: "replace-with-a-secret",
    SMTP_MODE: "catch",
    SMTP_FROM: "FahrSeiten <noreply@fahrseiten.local>",
  });

  assert.ok(errors.length >= 6);
  assert.ok(errors.some((error) => error.includes("HTTPS")));
  assert.ok(errors.some((error) => error.includes("Platzhalter")));
  assert.ok(errors.some((error) => error.includes("database")));
});
