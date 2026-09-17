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
  console.error(
    "FahrSeiten wurde wegen ungültiger Produktionskonfiguration nicht gestartet:",
  );
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

await import("./server.js");
