import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";

import { parseServerEnv } from "@/config/env-schema";

const env = parseServerEnv(process.env);
const connection = await mysql.createConnection(env.DATABASE_URL);

try {
  await migrate(drizzle({ client: connection }), {
    migrationsFolder: "./drizzle",
  });
  console.info("Datenbankmigrationen erfolgreich angewendet.");
} finally {
  await connection.end();
}
