import { existsSync, readFileSync } from "node:fs";
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
