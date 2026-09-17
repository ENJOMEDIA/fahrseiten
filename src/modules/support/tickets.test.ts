import { describe, expect, it } from "vitest";
import { changeTicketStatus } from "./tickets";

describe("support ticket history", () => {
  it("allows a resolved ticket to be reopened", () => {
    expect(changeTicketStatus("resolved", "in_progress")).toEqual({
      from: "resolved",
      to: "in_progress",
    });
  });
  it("keeps closed tickets final", () => {
    expect(() => changeTicketStatus("closed", "open")).toThrow(/Ungültiger/);
  });
});
