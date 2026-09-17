import "server-only";

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { env } from "@/config/env";

import * as schema from "./schema";

const globalDatabase = globalThis as typeof globalThis & {
  fahrseitenPool?: mysql.Pool;
};

const pool =
  globalDatabase.fahrseitenPool ??
  mysql.createPool({
    uri: env.DATABASE_URL,
    connectionLimit: 5,
    enableKeepAlive: true,
    decimalNumbers: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalDatabase.fahrseitenPool = pool;
}

export const db = drizzle({ client: pool, schema, mode: "default" });
