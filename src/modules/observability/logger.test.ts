import { describe, expect, it, vi } from "vitest";
import { redactContext, technicalLog } from "./logger";

describe("technical logging", () => {
  it("redacts credentials and full form fields", () => {
    expect(
      redactContext({
        password: "secret",
        authorization: "Bearer token",
        message: "private",
        route: "/api/test",
      }),
    ).toEqual({
      password: "[REDACTED]",
      authorization: "[REDACTED]",
      message: "[REDACTED]",
      route: "/api/test",
    });
  });

  it("returns a reference id without throwing to an external service", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const event = technicalLog("error", "test.failure", { token: "nope" });
    expect(event.referenceId).toMatch(/^FS-[A-F0-9]{8}$/);
    expect(event.context.token).toBe("[REDACTED]");
  });
});
