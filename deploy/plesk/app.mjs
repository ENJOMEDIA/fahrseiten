import { validateProductionEnvironment } from "./validate-env.mjs";

const errors = validateProductionEnvironment(process.env);

if (errors.length > 0) {
  console.error(
    "FahrSeiten wurde wegen ungültiger Produktionskonfiguration nicht gestartet:",
  );
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

await import("./server.js");
