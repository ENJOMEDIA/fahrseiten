import { access, readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const output = resolve(process.cwd(), "dist/plesk");
const required = [
  "app.mjs",
  "cron.mjs",
  "migrate.mjs",
  "validate-env.mjs",
  "server.js",
  "package.json",
  "DEPLOYMENT.json",
  "public",
  ".next/static",
  ".next/server",
  "drizzle/meta/_journal.json",
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
