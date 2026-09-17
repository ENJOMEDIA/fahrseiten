import { validateProductionEnvironment } from "./validate-env.mjs";
import { runMigrations } from "./migration-runner.mjs";
import { readRuntimeConfig, writeMigrationStatus } from "./runtime-config.mjs";

const runtimeConfig = readRuntimeConfig();
const effectiveEnvironment = {
  ...process.env,
  DATABASE_URL: runtimeConfig?.databaseUrl ?? process.env.DATABASE_URL,
};
const errors = validateProductionEnvironment(effectiveEnvironment, {
  allowDatabaseBootstrap: !runtimeConfig && Boolean(process.env.INSTALL_TOKEN),
});

function tryWriteMigrationStatus(status) {
  try {
    writeMigrationStatus(status);
  } catch (error) {
    console.error(
      "Der Migrationsstatus konnte nicht gespeichert werden; der Webserver startet trotzdem:",
      error instanceof Error ? error.message : "Unbekannter Dateifehler",
    );
  }
}

if (errors.length > 0) {
  throw new Error(
    [
      "FahrSeiten wurde wegen ungültiger Produktionskonfiguration nicht gestartet:",
      ...errors.map((error) => `- ${error}`),
    ].join("\n"),
  );
}

if (effectiveEnvironment.DATABASE_URL) {
  try {
    await runMigrations(effectiveEnvironment.DATABASE_URL);
    tryWriteMigrationStatus({
      status: "ready",
      checkedAt: new Date().toISOString(),
      detail:
        "Alle verfügbaren Datenbankmigrationen wurden beim Anwendungsstart angewendet.",
    });
    console.info("FahrSeiten-Datenbankschema ist aktuell.");
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
            .replace(/mysql:\/\/[^@\s]+@/giu, "mysql://[ZUGANGSDATEN]@")
            .slice(0, 2_000)
        : "Unbekannter Migrationsfehler";
    tryWriteMigrationStatus({
      status: "error",
      checkedAt: new Date().toISOString(),
      detail,
    });
    console.error(
      "Die automatische Datenbankmigration ist fehlgeschlagen. Der Webserver startet im Diagnosebetrieb weiter:",
      detail,
    );
  }
}

await import("./server.js");
