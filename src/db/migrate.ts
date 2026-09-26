import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";

import { parseServerEnv } from "@/config/env-schema";
import {
  isNewsletterMigrationConflict,
  repairInterruptedNewsletterMigration,
} from "@/modules/operations/migration-recovery";

const env = parseServerEnv(process.env);
const connection = await mysql.createConnection(env.DATABASE_URL);

try {
  const migrationsFolder = "./drizzle";
  const database = drizzle({ client: connection });
  await repairInterruptedNewsletterMigration(connection, migrationsFolder);
  try {
    await migrate(database, { migrationsFolder });
  } catch (error) {
    if (!isNewsletterMigrationConflict(error)) throw error;
    const repaired = await repairInterruptedNewsletterMigration(
      connection,
      migrationsFolder,
      { forceUnrecordedCheck: true },
    );
    if (!repaired) throw error;
    await migrate(database, { migrationsFolder });
  }
  console.info("Datenbankmigrationen erfolgreich angewendet.");
} finally {
  await connection.end();
}
