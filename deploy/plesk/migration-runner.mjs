import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { readMigrationFiles } from "drizzle-orm/migrator";
import mysql from "mysql2/promise";

const newsletterTables = [
  "sales_newsletter_recipients",
  "sales_newsletter_campaigns",
];

function migrationErrorDetail(error) {
  const details = [];
  let current = error;
  for (let depth = 0; current && depth < 3; depth += 1) {
    if (current instanceof Error && current.message)
      details.push(current.message);
    if (typeof current === "object" && current && "code" in current)
      details.push(String(current.code));
    current =
      typeof current === "object" && current && "cause" in current
        ? current.cause
        : null;
  }
  return (
    details
      .filter((detail, index) => details.indexOf(detail) === index)
      .join(" · ") || "Unbekannter Migrationsfehler"
  );
}

function isNewsletterMigrationConflict(error) {
  const detail = migrationErrorDetail(error);
  return (
    detail.includes("sales_newsletter_campaigns") &&
    (detail.includes("CREATE TABLE") ||
      detail.includes("ER_TABLE_EXISTS_ERROR"))
  );
}

async function repairInterruptedNewsletterMigration(
  connection,
  migrationsFolder,
  { forceUnrecordedCheck = false } = {},
) {
  const target = readMigrationFiles({ migrationsFolder }).find((migration) =>
    migration.sql.some((statement) =>
      statement.includes("sales_newsletter_campaigns"),
    ),
  );
  if (!target) return false;
  const [tableRows] = await connection.query(
    "SELECT `TABLE_NAME` AS `tableName` FROM `information_schema`.`TABLES` WHERE `TABLE_SCHEMA` = DATABASE() AND `TABLE_NAME` IN (?, ?, ?)",
    ["__drizzle_migrations", ...newsletterTables],
  );
  const foundTables = tableRows.map((row) => String(row.tableName));
  const existingTables = newsletterTables.filter((table) =>
    foundTables.includes(table),
  );
  let migrationApplied = false;
  if (!forceUnrecordedCheck && foundTables.includes("__drizzle_migrations")) {
    const [rows] = await connection.query(
      "SELECT COUNT(*) AS `applied` FROM `__drizzle_migrations` WHERE `hash` = ? OR `created_at` >= ?",
      [target.hash, target.folderMillis],
    );
    migrationApplied = Number(rows[0]?.applied ?? 0) > 0;
  }
  if (migrationApplied || existingTables.length === 0) return false;

  for (const table of existingTables) {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS \`rowCount\` FROM \`${table}\``,
    );
    if (Number(rows[0]?.rowCount ?? 0) > 0)
      throw new Error(
        "Die Newsletter-Migration wurde nur teilweise protokolliert, enthält aber bereits Daten. Es wurde nichts gelöscht. Bitte die Tabellen sales_newsletter_campaigns und sales_newsletter_recipients manuell prüfen.",
      );
  }
  await connection.query("DROP TABLE IF EXISTS `sales_newsletter_recipients`");
  await connection.query("DROP TABLE IF EXISTS `sales_newsletter_campaigns`");
  return true;
}

export async function runMigrations(databaseUrl) {
  const parsed = new URL(databaseUrl);
  if (parsed.protocol !== "mysql:") {
    throw new Error("DATABASE_URL muss das mysql-Protokoll verwenden.");
  }

  const connection = await mysql.createConnection({
    uri: databaseUrl,
    connectTimeout: 10_000,
  });
  try {
    const migrationsFolder = fileURLToPath(
      new URL("./drizzle", import.meta.url),
    );
    const repaired = await repairInterruptedNewsletterMigration(
      connection,
      migrationsFolder,
    );
    if (repaired)
      console.info(
        "Eine leere, unterbrochene Newsletter-Migration wurde sicher zurückgesetzt.",
      );
    try {
      await migrate(drizzle({ client: connection }), { migrationsFolder });
    } catch (error) {
      if (!isNewsletterMigrationConflict(error))
        throw new Error(migrationErrorDetail(error), { cause: error });
      const retryRepair = await repairInterruptedNewsletterMigration(
        connection,
        migrationsFolder,
        { forceUnrecordedCheck: true },
      );
      if (!retryRepair)
        throw new Error(migrationErrorDetail(error), { cause: error });
      console.info(
        "Der erkannte Newsletter-Tabellenkonflikt wurde sicher zurückgesetzt; die Migration wird einmal wiederholt.",
      );
      await migrate(drizzle({ client: connection }), { migrationsFolder });
    }
  } finally {
    await connection.end();
  }
}
