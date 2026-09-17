import { existsSync } from "node:fs";
import path from "node:path";

import {
  readRuntimeConfig,
  runtimeConfigPath,
} from "../deploy/plesk/runtime-config.mjs";
import { validateProductionEnvironment } from "../deploy/plesk/validate-env.mjs";

const requiredFiles = [
  "package.json",
  "plesk-start.mjs",
  "dist/plesk/app.mjs",
  "dist/plesk/server.js",
  "dist/plesk/public",
  "dist/plesk/.next/static",
];

const errors = [];

console.info(`Node.js: ${process.version}`);
console.info(`Arbeitsverzeichnis: ${process.cwd()}`);

if (!process.version.startsWith("v22.")) {
  errors.push(`Node.js 22 wird benötigt, gefunden wurde ${process.version}.`);
}

for (const relativePath of requiredFiles) {
  const present = existsSync(path.resolve(relativePath));
  console.info(`${present ? "OK" : "FEHLT"}: ${relativePath}`);
  if (!present) errors.push(`Erforderlicher Buildpfad fehlt: ${relativePath}`);
}

let runtimeConfig = null;
try {
  runtimeConfig = readRuntimeConfig();
  console.info(
    `Persistente Installation: ${runtimeConfig ? "vorhanden" : "noch nicht vorhanden"}`,
  );
  console.info(`Runtime-Konfigurationspfad: ${runtimeConfigPath()}`);
} catch (error) {
  errors.push(
    error instanceof Error
      ? error.message
      : "Die persistente Runtime-Konfiguration konnte nicht gelesen werden.",
  );
}

const effectiveEnvironment = {
  ...process.env,
  DATABASE_URL: runtimeConfig?.databaseUrl ?? process.env.DATABASE_URL,
};

const applicationEnvironmentVisible = [
  "APP_BASE_URL",
  "DEMO_DATA_MODE",
  "MARKETING_HOSTS",
  "APP_HOSTS",
  "SMTP_MODE",
].some((name) => Boolean(process.env[name]));

if (applicationEnvironmentVisible) {
  errors.push(
    ...validateProductionEnvironment(effectiveEnvironment, {
      allowDatabaseBootstrap:
        !runtimeConfig && Boolean(process.env.INSTALL_TOKEN),
    }),
  );

  if (!runtimeConfig && !process.env.INSTALL_TOKEN) {
    errors.push("Vor der Browserinstallation muss INSTALL_TOKEN gesetzt sein.");
  }
} else {
  console.info(
    "Hinweis: Plesk übergibt die Anwendungsvariablen nicht an diese Paket-Skriptumgebung. Sie werden hier deshalb nicht bewertet.",
  );
}

if (errors.length > 0) {
  console.error("Plesk-Startdiagnose fehlgeschlagen:");
  for (const error of [...new Set(errors)]) console.error(`- ${error}`);
  process.exit(1);
}

console.info(
  applicationEnvironmentVisible
    ? "Plesk-Startdiagnose erfolgreich. Build und Produktionskonfiguration sind startbereit."
    : "Plesk-Builddiagnose erfolgreich. Die Anwendungsvariablen werden erst beim Passenger-Start geprüft.",
);
