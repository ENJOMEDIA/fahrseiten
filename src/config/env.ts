import "server-only";

import { parseServerEnv } from "./env-schema";
import { readRuntimeConfigSync } from "./runtime-config";

const runtimeConfig = readRuntimeConfigSync();

export const env = parseServerEnv({
  ...process.env,
  DATABASE_URL: runtimeConfig?.databaseUrl ?? process.env.DATABASE_URL,
});
