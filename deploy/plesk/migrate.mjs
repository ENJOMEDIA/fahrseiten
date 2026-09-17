import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL fehlt.");

  const parsed = new URL(databaseUrl);
  if (parsed.protocol !== "mysql:") {
    throw new Error("DATABASE_URL muss das mysql-Protokoll verwenden.");
  }

  const connection = await mysql.createConnection(databaseUrl);
  try {
    await migrate(drizzle({ client: connection }), {
      migrationsFolder: "./drizzle",
    });
    console.info(
      "FahrSeiten-Datenbankmigrationen wurden erfolgreich angewendet.",
    );
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(
    "Die Datenbankmigration ist fehlgeschlagen:",
    error instanceof Error ? error.message : "Unbekannter Fehler",
  );
  process.exit(1);
});
