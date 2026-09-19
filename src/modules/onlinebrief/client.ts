import { createHash } from "node:crypto";
import { request as httpsRequest } from "node:https";
import { z } from "zod";

const API_URL = "https://api.onlinebrief24.de/v1";
const MAX_PDF_BYTES = 50 * 1024 * 1024;

const responseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z
    .object({
      id: z.number(),
      status: z.string(),
    })
    .passthrough(),
});

const printJobResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z
    .object({
      id: z.number(),
      status: z.string(),
      updated_at: z.string().optional(),
    })
    .passthrough(),
});

export type OnlinebriefCredentials = {
  apiKey: string;
  apiSecret: string;
  mode: "test" | "live";
};

export function createOnlinebriefPayload(input: {
  credentials: OnlinebriefCredentials;
  pdf: Uint8Array;
  filename: string;
  leadId: string;
  color?: boolean;
}) {
  if (input.pdf.length < 5 || input.pdf.length > MAX_PDF_BYTES)
    throw new Error("Der Brief muss eine PDF-Datei mit höchstens 50 MB sein.");
  if (new TextDecoder().decode(input.pdf.slice(0, 5)) !== "%PDF-")
    throw new Error("Der Brief ist keine gültige PDF-Datei.");
  const base64 = Buffer.from(input.pdf).toString("base64");
  return {
    auth: {
      apiKey: input.credentials.apiKey,
      apiSecret: input.credentials.apiSecret,
      mode: input.credentials.mode,
    },
    letter: {
      base64_file: base64,
      base64_file_checksum: createHash("md5").update(base64).digest("hex"),
      specification: {
        color: input.color ? "4" : "1",
        mode: "simplex",
        shipping: "national",
      },
      filename_original: input.filename
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .slice(0, 180),
      notice: `FahrSeiten Lead ${input.leadId}`.slice(0, 255),
      cost_unit: "FahrSeiten Akquise",
    },
  } as const;
}

export async function submitOnlinebrief(input: {
  credentials: OnlinebriefCredentials;
  pdf: Uint8Array;
  filename: string;
  leadId: string;
  color?: boolean;
  liveConfirmation?: string;
}) {
  if (
    input.credentials.mode === "live" &&
    input.liveConfirmation !== input.leadId
  )
    throw new Error(
      "Für den kostenpflichtigen Live-Versand muss die Lead-ID erneut bestätigt werden.",
    );
  const response = await fetch(`${API_URL}/printjobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createOnlinebriefPayload(input)),
    signal: AbortSignal.timeout(30_000),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      `Onlinebrief24 hat den Auftrag abgelehnt (${response.status}).`,
    );
  return responseSchema.parse(body);
}

export async function deleteOnlinebrief(
  credentials: OnlinebriefCredentials,
  providerJobId: string,
) {
  const jobId = z.string().regex(/^\d+$/).parse(providerJobId);
  const response = await fetch(`${API_URL}/printjobs/${jobId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth: {
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        mode: credentials.mode,
      },
    }),
    signal: AbortSignal.timeout(30_000),
  });
  const body = await response.json().catch(() => null);
  if (response.status === 404)
    return {
      status: 404,
      message: "Print job is no longer available",
    };
  if (!response.ok)
    throw new Error(
      `OnlineBrief24 konnte den Auftrag nicht löschen (${response.status}). Aufträge lassen sich dort nur innerhalb von 15 Minuten und nicht mehr im Status „done“ löschen.`,
    );
  return z
    .object({ status: z.number(), message: z.string() })
    .passthrough()
    .parse(body);
}

export async function getOnlinebrief(
  credentials: OnlinebriefCredentials,
  providerJobId: string,
) {
  const jobId = z.string().regex(/^\d+$/).parse(providerJobId);
  const payload = JSON.stringify({
    auth: {
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      mode: credentials.mode,
    },
  });
  const response = await new Promise<{ status: number; body: unknown }>(
    (resolve, reject) => {
      const request = httpsRequest(
        `${API_URL}/printjobs/${jobId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
          },
          timeout: 30_000,
        },
        (incoming) => {
          const chunks: Buffer[] = [];
          incoming.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
          incoming.on("end", () => {
            const raw = Buffer.concat(chunks).toString("utf8");
            let body: unknown = null;
            try {
              body = raw ? JSON.parse(raw) : null;
            } catch {
              body = null;
            }
            resolve({ status: incoming.statusCode ?? 500, body });
          });
        },
      );
      request.on("timeout", () =>
        request.destroy(new Error("OnlineBrief24-Statusabfrage abgelaufen.")),
      );
      request.on("error", reject);
      request.write(payload);
      request.end();
    },
  );
  if (response.status === 404) return null;
  if (response.status < 200 || response.status >= 300)
    throw new Error(
      `OnlineBrief24-Statusabfrage fehlgeschlagen (${response.status}).`,
    );
  return printJobResponseSchema.parse(response.body).data;
}
