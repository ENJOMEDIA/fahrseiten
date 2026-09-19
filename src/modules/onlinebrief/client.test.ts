import { afterEach, describe, expect, it, vi } from "vitest";

import { createOnlinebriefPayload, deleteOnlinebrief } from "./client";

afterEach(() => vi.restoreAllMocks());

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

  it("deletes a provider job with the documented authenticated endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 200,
          message: "Print job deleted successfully",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    await deleteOnlinebrief(
      { apiKey: "key", apiSecret: "secret", mode: "test" },
      "6035143",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.onlinebrief24.de/v1/printjobs/6035143",
      expect.objectContaining({ method: "DELETE" }),
    );
    const request = fetchMock.mock.calls[0]?.[1];
    expect(JSON.parse(String(request?.body))).toEqual({
      auth: { apiKey: "key", apiSecret: "secret", mode: "test" },
    });
  });

  it("treats an already removed provider job as locally deletable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 404 }),
    );
    await expect(
      deleteOnlinebrief(
        { apiKey: "key", apiSecret: "secret", mode: "test" },
        "6035143",
      ),
    ).resolves.toMatchObject({ status: 404 });
  });
});
