import { runMigrations } from "./migration-runner.mjs";
import { resolveDatabaseUrl, writeMigrationStatus } from "./runtime-config.mjs";

async function main() {
  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) throw new Error("DATABASE_URL fehlt.");

  await runMigrations(databaseUrl);
  writeMigrationStatus({
    status: "ready",
    checkedAt: new Date().toISOString(),
    detail: "Alle verfügbaren Datenbankmigrationen wurden manuell angewendet.",
  });
  console.info(
    "FahrSeiten-Datenbankmigrationen wurden erfolgreich angewendet.",
  );
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : "Unbekannter Fehler";
  writeMigrationStatus({
    status: "error",
    checkedAt: new Date().toISOString(),
    detail: detail
      .replace(/mysql:\/\/[^@\s]+@/giu, "mysql://[ZUGANGSDATEN]@")
      .slice(0, 2_000),
  });
  console.error("Die Datenbankmigration ist fehlgeschlagen:", detail);
  process.exit(1);
});
