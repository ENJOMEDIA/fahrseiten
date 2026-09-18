import { describe, expect, it } from "vitest";

import { createOnlinebriefPayload } from "./client";

describe("Onlinebrief24 payload", () => {
  it("creates the documented base64 checksum and keeps the lead reference", () => {
    const payload = createOnlinebriefPayload({
      credentials: { apiKey: "key", apiSecret: "secret", mode: "test" },
      pdf: new TextEncoder().encode("%PDF-example"),
      filename: "Anschreiben Beispiel.pdf",
      leadId: "4c726f8d-795d-47fc-8262-49b28db717f0",
    });
    expect(payload.auth.mode).toBe("test");
    expect(payload.letter.base64_file_checksum).toHaveLength(32);
    expect(payload.letter.notice).toContain(
      "4c726f8d-795d-47fc-8262-49b28db717f0",
    );
    expect(payload.letter.filename_original).toBe("Anschreiben-Beispiel.pdf");
  });
});
