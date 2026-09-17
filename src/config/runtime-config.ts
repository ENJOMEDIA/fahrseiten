import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

import { z } from "zod";

const runtimeConfigSchema = z.object({
  version: z.literal(1),
  installationCompletedAt: z.iso.datetime(),
  databaseUrl: z.url().refine((value) => value.startsWith("mysql://")),
});

export type RuntimeConfig = z.infer<typeof runtimeConfigSchema>;

export function runtimeConfigPath(
  source: Record<string, string | undefined> = process.env,
) {
  const configured = source.FAHRSEITEN_CONFIG_FILE?.trim();
  const fallback =
    source.NODE_ENV === "production"
      ? path.join(source.HOME || homedir(), ".fahrseiten", "runtime.json")
      : path.join(process.cwd(), ".local-storage", "runtime-config.json");
  return path.resolve(configured || fallback);
}

export function readRuntimeConfigSync(
  source: Record<string, string | undefined> = process.env,
): RuntimeConfig | null {
  const file = runtimeConfigPath(source);
  if (!existsSync(file)) return null;
  return runtimeConfigSchema.parse(JSON.parse(readFileSync(file, "utf8")));
}

export async function readRuntimeConfig(
  source: Record<string, string | undefined> = process.env,
) {
  const file = runtimeConfigPath(source);
  try {
    return runtimeConfigSchema.parse(JSON.parse(await readFile(file, "utf8")));
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }
    throw error;
  }
}

export async function writeRuntimeConfig(
  config: RuntimeConfig,
  source: Record<string, string | undefined> = process.env,
) {
  const parsed = runtimeConfigSchema.parse(config);
  const file = runtimeConfigPath(source);
  const directory = path.dirname(file);
  const temporary = `${file}.${process.pid}.tmp`;

  await mkdir(directory, { recursive: true, mode: 0o700 });
  await writeFile(temporary, `${JSON.stringify(parsed, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  await rename(temporary, file);
  await chmod(file, 0o600);
}

export function buildMysqlUrl(input: {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}) {
  const host = input.host.includes(":") ? `[${input.host}]` : input.host;
  return `mysql://${encodeURIComponent(input.user)}:${encodeURIComponent(input.password)}@${host}:${input.port}/${encodeURIComponent(input.database)}`;
}
