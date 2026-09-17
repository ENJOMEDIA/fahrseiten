import assert from "node:assert/strict";
import { test } from "node:test";

import {
  installPlatform,
  validateBootstrapInput,
} from "../deploy/plesk/install.mjs";
import { hashInstallerPassword } from "../deploy/plesk/password.mjs";
import { validateProductionEnvironment } from "../deploy/plesk/validate-env.mjs";
import { verifyPassword } from "../src/modules/auth/password.ts";

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

test("creates password hashes compatible with application login", async () => {
  const password = "Sicheres-Installationspasswort-2026!";
  const hash = await hashInstallerPassword(password);

  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword("Falsches-Passwort-2026!", hash), false);
});

test("validates first-owner bootstrap input without exposing values", () => {
  const valid = validateBootstrapInput({
    INSTALL_OWNER_EMAIL: " OWNER@FAHRSEITEN.DE ",
    INSTALL_OWNER_NAME: "ENJO MEDIA",
    INSTALL_OWNER_PASSWORD: "Sicheres-Installationspasswort-2026!",
  });
  assert.deepEqual(valid.errors, []);
  assert.equal(valid.email, "owner@fahrseiten.de");

  const invalid = validateBootstrapInput({});
  assert.equal(invalid.errors.length, 3);
});

test("requires DATABASE_URL before connecting", async () => {
  await assert.rejects(() => installPlatform({}), /DATABASE_URL fehlt/);
});
