import { readMigrationFiles } from "drizzle-orm/migrator";
import type { Connection, RowDataPacket } from "mysql2/promise";

const newsletterTables = [
  "sales_newsletter_recipients",
  "sales_newsletter_campaigns",
] as const;

export function interruptedMigrationRecoveryDecision(input: {
  migrationApplied: boolean;
  existingTables: string[];
  rowCounts: Record<string, number>;
}) {
  if (input.migrationApplied || input.existingTables.length === 0)
    return "none" as const;
  if (input.existingTables.some((table) => (input.rowCounts[table] ?? 0) > 0))
    return "blocked" as const;
  return "reset" as const;
}

async function findTables(connection: Connection, names: readonly string[]) {
  const [rows] = await connection.query<
    Array<RowDataPacket & { tableName: string }>
  >(
    "SELECT `TABLE_NAME` AS `tableName` FROM `information_schema`.`TABLES` WHERE `TABLE_SCHEMA` = DATABASE() AND `TABLE_NAME` IN (?, ?, ?)",
    ["__drizzle_migrations", ...names],
  );
  return rows.map((row) => String(row.tableName));
}

export async function repairInterruptedNewsletterMigration(
  connection: Connection,
  migrationsFolder: string,
) {
  const target = readMigrationFiles({ migrationsFolder }).find((migration) =>
    migration.sql.some((statement) =>
      statement.includes("sales_newsletter_campaigns"),
    ),
  );
  if (!target) return false;

  const foundTables = await findTables(connection, newsletterTables);
  const existingTables = newsletterTables.filter((table) =>
    foundTables.includes(table),
  );
  let migrationApplied = false;
  if (foundTables.includes("__drizzle_migrations")) {
    const [rows] = await connection.query<
      Array<RowDataPacket & { applied: number }>
    >(
      "SELECT COUNT(*) AS `applied` FROM `__drizzle_migrations` WHERE `hash` = ? OR `created_at` >= ?",
      [target.hash, target.folderMillis],
    );
    migrationApplied = Number(rows[0]?.applied ?? 0) > 0;
  }

  const rowCounts: Record<string, number> = {};
  for (const table of existingTables) {
    const [rows] = await connection.query<
      Array<RowDataPacket & { rowCount: number }>
    >(`SELECT COUNT(*) AS \`rowCount\` FROM \`${table}\``);
    rowCounts[table] = Number(rows[0]?.rowCount ?? 0);
  }

  const decision = interruptedMigrationRecoveryDecision({
    migrationApplied,
    existingTables,
    rowCounts,
  });
  if (decision === "none") return false;
  if (decision === "blocked")
    throw new Error(
      "Die Newsletter-Migration wurde nur teilweise protokolliert, enthält aber bereits Daten. Es wurde nichts gelöscht. Bitte die Tabellen sales_newsletter_campaigns und sales_newsletter_recipients manuell prüfen.",
    );

  await connection.query("DROP TABLE IF EXISTS `sales_newsletter_recipients`");
  await connection.query("DROP TABLE IF EXISTS `sales_newsletter_campaigns`");
  return true;
}
