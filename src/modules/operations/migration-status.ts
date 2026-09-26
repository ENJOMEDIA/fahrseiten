import "server-only";

import { chmod, mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { readMigrationFiles } from "drizzle-orm/migrator";
import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2/promise";

import { env } from "@/config/env";
import { runtimeConfigPath } from "@/config/runtime-config";
import { compareMigrationState } from "./migration-state";
import { repairInterruptedNewsletterMigration } from "./migration-recovery";

export type MigrationStatus = {
  status: "ready" | "pending" | "error";
  checkedAt: string;
  detail: string;
};
export type MigrationStatusView =
  | MigrationStatus
  | { status: "unknown" | "error"; checkedAt: null; detail: string };

const migrationsFolder = path.join(process.cwd(), "drizzle");

function statusPath() {
  return path.join(path.dirname(runtimeConfigPath()), "migration-status.json");
}

function safeError(error: unknown) {
  const details: string[] = [];
  let current: unknown = error;
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
  )
    .replace(/mysql:\/\/[^@\s]+@/giu, "mysql://[ZUGANGSDATEN]@")
    .slice(0, 2_000);
}

async function writeMigrationStatus(status: MigrationStatus) {
  const file = statusPath();
  const directory = path.dirname(file);
  const temporary = `${file}.${process.pid}.tmp`;
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await writeFile(temporary, `${JSON.stringify(status, null, 2)}\n`, {
    mode: 0o600,
  });
  await rename(temporary, file);
  await chmod(file, 0o600);
}

function errorCode(error: unknown) {
  return error && typeof error === "object" && "code" in error
    ? String(error.code)
    : null;
}

async function inspectMigrationStatus(
  connection: mysql.Connection,
): Promise<MigrationStatus> {
  const checkedAt = new Date().toISOString();
  const available = readMigrationFiles({ migrationsFolder });
  try {
    const [rows] = await connection.query<
      Array<RowDataPacket & { hash: string; created_at: string | number }>
    >(
      "SELECT `hash`, `created_at` FROM `__drizzle_migrations` ORDER BY `created_at` DESC LIMIT 1",
    );
    const row = rows[0];
    const compared = compareMigrationState(
      available,
      row
        ? { hash: String(row.hash), createdAt: Number(row.created_at) }
        : null,
    );
    return { ...compared, checkedAt };
  } catch (error) {
    if (errorCode(error) === "ER_NO_SUCH_TABLE")
      return {
        status: "pending",
        checkedAt,
        detail: `${available.length} Datenbankmigrationen sind noch nicht angewendet.`,
      };
    throw error;
  }
}

export async function readMigrationStatus(): Promise<MigrationStatusView> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
      uri: env.DATABASE_URL,
      connectTimeout: 10_000,
    });
    return await inspectMigrationStatus(connection);
  } catch (error) {
    return {
      status: "error",
      checkedAt: null,
      detail: safeError(error),
    };
  } finally {
    await connection?.end();
  }
}

export async function runDatabaseMigrations(): Promise<MigrationStatus> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
      uri: env.DATABASE_URL,
      connectTimeout: 10_000,
    });
    await repairInterruptedNewsletterMigration(connection, migrationsFolder);
    await migrate(drizzle({ client: connection }), {
      migrationsFolder,
    });
    const status = await inspectMigrationStatus(connection);
    await writeMigrationStatus(status);
    return status;
  } catch (error) {
    const status: MigrationStatus = {
      status: "error",
      checkedAt: new Date().toISOString(),
      detail: safeError(error),
    };
    await writeMigrationStatus(status);
    return status;
  } finally {
    await connection?.end();
  }
}
