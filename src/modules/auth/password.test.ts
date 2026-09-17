import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies the right password and rejects a wrong password", async () => {
    const hash = await hashPassword("Lokales-Demo-Passwort-2026!");
    await expect(
      verifyPassword("Lokales-Demo-Passwort-2026!", hash),
    ).resolves.toBe(true);
    await expect(verifyPassword("Falsches-Passwort-2026!", hash)).resolves.toBe(
      false,
    );
  });

  it("rejects short passwords", async () => {
    await expect(hashPassword("zu-kurz")).rejects.toThrow(/12/);
  });
});
