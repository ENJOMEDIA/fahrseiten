import { validateProductionEnvironment } from "./validate-env.mjs";
import { readRuntimeConfig } from "./runtime-config.mjs";

const runtimeConfig = readRuntimeConfig();
const effectiveEnvironment = {
  ...process.env,
  DATABASE_URL: runtimeConfig?.databaseUrl ?? process.env.DATABASE_URL,
};
const errors = validateProductionEnvironment(effectiveEnvironment, {
  allowDatabaseBootstrap: !runtimeConfig && Boolean(process.env.INSTALL_TOKEN),
});

if (errors.length > 0) {
  throw new Error(
    [
      "FahrSeiten wurde wegen ungültiger Produktionskonfiguration nicht gestartet:",
      ...errors.map((error) => `- ${error}`),
    ].join("\n"),
  );
}

await import("./server.js");
