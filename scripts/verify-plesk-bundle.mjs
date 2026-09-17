import { access, readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const output = resolve(process.cwd(), "dist/plesk");
const required = [
  "app.mjs",
  "cron.mjs",
  "install.mjs",
  "migrate.mjs",
  "password.mjs",
  "runtime-config.mjs",
  "validate-env.mjs",
  "server.js",
  "package.json",
  "DEPLOYMENT.json",
  "GO-LIVE.md",
  "DEPLOYMENT.md",
  "ENVIRONMENT.example.txt",
  "public",
  ".next/static",
  ".next/server",
  "drizzle/meta/_journal.json",
  "schema/fahrseiten-schema.sql",
];

for (const path of required) await access(resolve(output, path));

const entries = await readdir(output, { recursive: true });
const forbidden = entries.filter(
  (entry) => entry === ".env" || entry.startsWith(".env."),
);
if (forbidden.length > 0) {
  throw new Error(
    `Das Plesk-Artefakt enthält verbotene Env-Dateien: ${forbidden.join(", ")}`,
  );
}

const manifest = JSON.parse(
  await readFile(resolve(output, "DEPLOYMENT.json"), "utf8"),
);
if (manifest.startupFile !== "app.mjs") {
  throw new Error(
    "Das Deployment-Manifest nennt nicht app.mjs als Startdatei.",
  );
}

const bundlePackage = JSON.parse(
  await readFile(resolve(output, "package.json"), "utf8"),
);
if (
  bundlePackage.scripts?.start !== "node app.mjs" ||
  bundlePackage.scripts?.["install:platform"] !== "node install.mjs"
) {
  throw new Error("Dem Plesk-Artefakt fehlen Start- oder Installationsskript.");
}

const journal = JSON.parse(
  await readFile(resolve(output, "drizzle/meta/_journal.json"), "utf8"),
);
const bundledSchema = await readFile(
  resolve(output, "schema/fahrseiten-schema.sql"),
  "utf8",
);
const recordedMigrations = bundledSchema.match(
  /INSERT INTO `__drizzle_migrations`/g,
);
if ((recordedMigrations?.length ?? 0) !== journal.entries.length) {
  throw new Error("Das SQL-Gesamtschema enthält nicht alle Migrationen.");
}

const requireFromBundle = createRequire(resolve(output, "migrate.mjs"));
for (const dependency of [
  "drizzle-orm/mysql2",
  "drizzle-orm/mysql2/migrator",
  "mysql2/promise",
]) {
  requireFromBundle.resolve(dependency);
}

console.info(
  `Plesk-Artefakt geprüft (${entries.length} Einträge, keine Env-Dateien).`,
);
