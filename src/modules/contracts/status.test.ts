import { describe, expect, it } from "vitest";

import {
  contractStatusForSignature,
  isTerminalSignatureStatus,
  mayTransitionSignatureRequest,
} from "./status";

describe("signature status", () => {
  it("accepts the normal signing lifecycle", () => {
    expect(mayTransitionSignatureRequest("created", "pending")).toBe(true);
    expect(mayTransitionSignatureRequest("pending", "opened")).toBe(true);
    expect(mayTransitionSignatureRequest("opened", "signed")).toBe(true);
    expect(contractStatusForSignature("signed")).toBe("signed");
  });

  it("does not reopen completed requests", () => {
    expect(isTerminalSignatureStatus("signed")).toBe(true);
    expect(mayTransitionSignatureRequest("signed", "pending")).toBe(false);
    expect(mayTransitionSignatureRequest("declined", "opened")).toBe(false);
  });

  it("allows retrying a failed provider request", () => {
    expect(mayTransitionSignatureRequest("failed", "pending")).toBe(true);
    expect(contractStatusForSignature("failed")).toBe("sent");
  });
});
