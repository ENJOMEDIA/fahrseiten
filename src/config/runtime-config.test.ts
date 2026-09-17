import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  buildMysqlUrl,
  readRuntimeConfig,
  runtimeConfigPath,
  writeRuntimeConfig,
} from "./runtime-config";

describe("persistent runtime configuration", () => {
  it("stores the database configuration outside a release with restrictive permissions", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "fahrseiten-config-"));
    const file = path.join(directory, "shared", "runtime.json");
    const source = { FAHRSEITEN_CONFIG_FILE: file };
    const config = {
      version: 1 as const,
      installationCompletedAt: "2026-09-17T12:00:00.000Z",
      databaseUrl: "mysql://user:password@db.internal:3306/fahrseiten",
    };

    await writeRuntimeConfig(config, source);

    expect(runtimeConfigPath(source)).toBe(file);
    await expect(readRuntimeConfig(source)).resolves.toEqual(config);
    expect((await stat(file)).mode & 0o777).toBe(0o600);
    expect(await readFile(file, "utf8")).not.toContain("INSTALL_TOKEN");
  });

  it("encodes database credentials in a MySQL URL", () => {
    expect(
      buildMysqlUrl({
        host: "db.internal",
        port: 3306,
        database: "fahrseiten_prod",
        user: "fahrseiten_user",
        password: "special:@/ password",
      }),
    ).toBe(
      "mysql://fahrseiten_user:special%3A%40%2F%20password@db.internal:3306/fahrseiten_prod",
    );
  });
});
