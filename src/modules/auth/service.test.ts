import { describe, expect, it } from "vitest";

import { hashPassword } from "./password";
import { authenticateWithPassword } from "./service";

describe("authenticateWithPassword", () => {
  it("accepts active users and keeps the lookup normalized", async () => {
    const passwordHash = await hashPassword("Lokales-Demo-Passwort-2026!");
    const findUser = async (email: string) => ({
      id: "user-1",
      email,
      displayName: "Demo",
      passwordHash,
      platformRole: null,
      active: true,
    });
    const user = await authenticateWithPassword({
      email: " DEMO@EXAMPLE.TEST ",
      password: "Lokales-Demo-Passwort-2026!",
      findUser,
    });
    expect(user?.email).toBe("demo@example.test");
  });

  it("rejects inactive users", async () => {
    const passwordHash = await hashPassword("Lokales-Demo-Passwort-2026!");
    await expect(
      authenticateWithPassword({
        email: "demo@example.test",
        password: "Lokales-Demo-Passwort-2026!",
        findUser: async (email) => ({
          id: "user-1",
          email,
          displayName: "Demo",
          passwordHash,
          platformRole: null,
          active: false,
        }),
      }),
    ).resolves.toBeNull();
  });
});
