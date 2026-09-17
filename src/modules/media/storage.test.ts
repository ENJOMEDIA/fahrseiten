import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { LocalMediaStorage } from "./storage";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("local media storage", () => {
  it("removes a stored tenant asset and accepts an already missing file", async () => {
    const directory = await mkdtemp(
      path.join(os.tmpdir(), "fahrseiten-media-"),
    );
    directories.push(directory);
    const storage = new LocalMediaStorage(directory);
    const key = "tenant-id/example.png";

    await storage.write(key, new Uint8Array([1, 2, 3]));
    await storage.delete(key);

    await expect(storage.read(key)).rejects.toMatchObject({ code: "ENOENT" });
    await expect(storage.delete(key)).resolves.toBeUndefined();
  });
});
