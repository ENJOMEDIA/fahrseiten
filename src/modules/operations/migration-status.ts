import "server-only";

import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import { z } from "zod";

import { env } from "@/config/env";
import { runtimeConfigPath } from "@/config/runtime-config";

const migrationStatusSchema = z.object({
  status: z.enum(["ready", "error"]),
  checkedAt: z.iso.datetime(),
  detail: z.string().max(2_000),
});

export type MigrationStatus = z.infer<typeof migrationStatusSchema>;
export type MigrationStatusView =
  | MigrationStatus
  | { status: "unknown" | "error"; checkedAt: null; detail: string };

function statusPath() {
  return path.join(path.dirname(runtimeConfigPath()), "migration-status.json");
}

function safeError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unbekannter Migrationsfehler";
  return message
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

export async function readMigrationStatus(): Promise<MigrationStatusView> {
  try {
    return migrationStatusSchema.parse(
      JSON.parse(await readFile(statusPath(), "utf8")),
    );
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      const code = String(error.code);
      if (code === "ENOENT") {
        return {
          status: "unknown",
          checkedAt: null,
          detail: "Noch kein automatischer Migrationslauf protokolliert.",
        };
      }
    }
    return {
      status: "error",
      checkedAt: null,
      detail: "Der gespeicherte Migrationsstatus ist nicht lesbar.",
    };
  }
}

export async function runDatabaseMigrations(): Promise<MigrationStatus> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
      uri: env.DATABASE_URL,
      connectTimeout: 10_000,
    });
    await migrate(drizzle({ client: connection }), {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });
    const status: MigrationStatus = {
      status: "ready",
      checkedAt: new Date().toISOString(),
      detail: "Alle verfügbaren Datenbankmigrationen wurden angewendet.",
    };
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
