import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const migrationsDirectory = resolve(root, "drizzle");
const journal = JSON.parse(
  await readFile(resolve(migrationsDirectory, "meta/_journal.json"), "utf8"),
);

const sections = [
  "-- FahrSeiten – vollständiges Schema für eine neue, leere MySQL-/MariaDB-Datenbank.",
  "-- Automatisch aus den versionierten Drizzle-Migrationen erzeugt.",
  "-- Nicht auf eine bereits initialisierte Datenbank importieren; dort den Installer verwenden.",
  "",
  "CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (",
  "  `id` serial PRIMARY KEY,",
  "  `hash` text NOT NULL,",
  "  `created_at` bigint",
  ");",
  "",
];

for (const entry of journal.entries) {
  const migrationPath = resolve(migrationsDirectory, `${entry.tag}.sql`);
  const sql = await readFile(migrationPath, "utf8");
  const hash = createHash("sha256").update(sql).digest("hex");
  sections.push(
    `-- Migration ${entry.tag}`,
    sql.replaceAll("--> statement-breakpoint", ""),
    "INSERT INTO `__drizzle_migrations` (`hash`, `created_at`)",
    `VALUES ('${hash}', ${entry.when});`,
    "",
  );
}

const outputDirectory = resolve(root, "dist/sql");
await mkdir(outputDirectory, { recursive: true });
const output = resolve(outputDirectory, "fahrseiten-schema.sql");
await writeFile(output, `${sections.join("\n").trim()}\n`);
console.info(
  `SQL-Schema mit ${journal.entries.length} Migrationen erstellt: ${output}`,
);
