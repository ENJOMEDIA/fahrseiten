import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

export function runtimeConfigPath(source = process.env) {
  const configured = source.FAHRSEITEN_CONFIG_FILE?.trim();
  return path.resolve(
    configured ||
      path.join(source.HOME || homedir(), ".fahrseiten", "runtime.json"),
  );
}

export function readRuntimeConfig(source = process.env) {
  const file = runtimeConfigPath(source);
  if (!existsSync(file)) return null;

  const value = JSON.parse(readFileSync(file, "utf8"));
  if (
    value?.version !== 1 ||
    typeof value.installationCompletedAt !== "string" ||
    typeof value.databaseUrl !== "string" ||
    !value.databaseUrl.startsWith("mysql://")
  ) {
    throw new Error("Die persistente FahrSeiten-Konfiguration ist ungültig.");
  }
  return value;
}

export function resolveDatabaseUrl(source = process.env) {
  const useRuntimeConfig =
    source === process.env || Boolean(source.FAHRSEITEN_CONFIG_FILE);
  return (
    (useRuntimeConfig ? readRuntimeConfig(source)?.databaseUrl : undefined) ??
    source.DATABASE_URL
  );
}

export function migrationStatusPath(source = process.env) {
  return path.join(
    path.dirname(runtimeConfigPath(source)),
    "migration-status.json",
  );
}

export function writeMigrationStatus(status, source = process.env) {
  const file = migrationStatusPath(source);
  const directory = path.dirname(file);
  const temporary = `${file}.${process.pid}.tmp`;
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  writeFileSync(temporary, `${JSON.stringify(status, null, 2)}\n`, {
    mode: 0o600,
  });
  renameSync(temporary, file);
  chmodSync(file, 0o600);
}
