import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  installPlatform,
  validateBootstrapInput,
} from "../deploy/plesk/install.mjs";
import { hashInstallerPassword } from "../deploy/plesk/password.mjs";
import {
  readRuntimeConfig,
  resolveDatabaseUrl,
} from "../deploy/plesk/runtime-config.mjs";
import { validateProductionEnvironment } from "../deploy/plesk/validate-env.mjs";
import { verifyPassword } from "../src/modules/auth/password.ts";

const validEnvironment = {
  NODE_ENV: "production",
  APP_BASE_URL: "https://fahrseiten.de",
  PUBLIC_DNS_TARGET_HOST: "fahrseiten.de",
  DATABASE_URL: "mysql://fahrseiten:secret@db.internal:3306/fahrseiten",
  DEMO_DATA_MODE: "database",
  MARKETING_HOSTS: "fahrseiten.de,www.fahrseiten.de",
  APP_HOSTS: "app.fahrseiten.de",
  CRON_SECRET: "a-random-secret-with-32-characters",
  CRON_TRIGGER_TOKEN: "a-separate-trigger-token-with-32-characters",
  SMTP_MODE: "smtp",
  SMTP_HOST: "mx.test.invalid",
  SMTP_PORT: "465",
  SMTP_USER: "noreply@fahrseiten.de",
  SMTP_PASSWORD: "smtp-test-password",
  SMTP_FROM: "FahrSeiten <noreply@fahrseiten.de>",
};

test("accepts a complete production environment", () => {
  assert.deepEqual(validateProductionEnvironment(validEnvironment), []);
});

test("allows the dashboard on the main domain without an app subdomain", () => {
  assert.deepEqual(
    validateProductionEnvironment({
      ...validEnvironment,
      APP_HOSTS: "",
      DASHBOARD_BASE_URL: "",
    }),
    [],
  );
});

test("accepts a later HTTPS dashboard host", () => {
  assert.deepEqual(
    validateProductionEnvironment({
      ...validEnvironment,
      DASHBOARD_BASE_URL: "https://app.fahrseiten.de",
    }),
    [],
  );
});

test("requires a dedicated URL trigger token", () => {
  const sharedSecret = "one-secret-must-not-protect-both-cron-paths";
  const errors = validateProductionEnvironment({
    ...validEnvironment,
    CRON_SECRET: sharedSecret,
    CRON_TRIGGER_TOKEN: sharedSecret,
  });
  assert.ok(errors.some((error) => error.includes("müssen verschieden sein")));
});

test("allows the one-time database bootstrap when the install token exists", () => {
  const withoutDatabase = { ...validEnvironment };
  delete withoutDatabase.DATABASE_URL;
  assert.deepEqual(
    validateProductionEnvironment(withoutDatabase, {
      allowDatabaseBootstrap: true,
    }),
    [],
  );
});

test("loads the persistent database URL for later starts and migrations", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "fahrseiten-plesk-"));
  const file = path.join(directory, "runtime.json");
  const config = {
    version: 1,
    installationCompletedAt: "2026-09-17T12:00:00.000Z",
    databaseUrl: "mysql://user:password@db.internal:3306/fahrseiten",
  };
  await writeFile(file, JSON.stringify(config), { mode: 0o600 });

  const source = { FAHRSEITEN_CONFIG_FILE: file };
  assert.deepEqual(readRuntimeConfig(source), config);
  assert.equal(resolveDatabaseUrl(source), config.databaseUrl);
});

test("rejects a runtime configuration path inside the release", () => {
  const errors = validateProductionEnvironment({
    ...validEnvironment,
    FAHRSEITEN_CONFIG_FILE: path.join(process.cwd(), "runtime.json"),
  });
  assert.ok(errors.some((error) => error.includes("Application Root")));
});

test("rejects local defaults and missing production settings", () => {
  const errors = validateProductionEnvironment({
    ...validEnvironment,
    APP_BASE_URL: "http://localhost:3000",
    DATABASE_URL:
      "mysql://fahrseiten_local:local_only@127.0.0.1:3306/fahrseiten_local",
    DEMO_DATA_MODE: "fixture",
    CRON_SECRET: "replace-with-a-secret",
    CRON_TRIGGER_TOKEN: "replace-with-a-trigger-token",
    SMTP_MODE: "catch",
    SMTP_HOST: "localhost",
    SMTP_PORT: "invalid",
    SMTP_USER: "",
    SMTP_PASSWORD: "",
    SMTP_FROM: "FahrSeiten <noreply@fahrseiten.local>",
  });

  assert.deepEqual(errors, [
    "APP_BASE_URL muss eine HTTPS-URL sein.",
    "DATABASE_URL enthält einen erkennbaren Platzhalter.",
    "DEMO_DATA_MODE muss im Plesk-Betrieb database sein.",
    "CRON_SECRET muss ein zufälliger Wert mit mindestens 24 Zeichen sein.",
    "CRON_TRIGGER_TOKEN muss ein eigener zufälliger Wert mit mindestens 32 Zeichen sein.",
    "SMTP_MODE muss im Plesk-Betrieb smtp sein.",
    "SMTP_HOST muss ein realer SMTP-Host sein.",
    "SMTP_PORT muss ein gültiger Port sein.",
    "SMTP_USER und SMTP_PASSWORD müssen gesetzt sein.",
    "SMTP_FROM muss eine reale, freigegebene Absenderadresse sein.",
  ]);
});

test("rejects a local DNS target for customer domains", () => {
  const errors = validateProductionEnvironment({
    ...validEnvironment,
    PUBLIC_DNS_TARGET_HOST: "app.localhost",
  });
  assert.ok(
    errors.includes(
      "PUBLIC_DNS_TARGET_HOST muss ein öffentlicher Hostname sein.",
    ),
  );
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
