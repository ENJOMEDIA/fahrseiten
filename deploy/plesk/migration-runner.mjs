import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

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
    await migrate(drizzle({ client: connection }), {
      migrationsFolder: fileURLToPath(new URL("./drizzle", import.meta.url)),
    });
  } finally {
    await connection.end();
  }
}
