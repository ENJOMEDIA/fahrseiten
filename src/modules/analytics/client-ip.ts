import { isIP } from "node:net";

export type AnalyticsClientIpHeader = "none" | "x-real-ip" | "x-forwarded-for";

export function clientIpFromHeader(
  headers: Headers,
  header: AnalyticsClientIpHeader,
) {
  if (header === "none") return null;
  const candidate = headers.get(header)?.split(",")[0]?.trim() ?? "";
  const normalized = candidate.startsWith("::ffff:")
    ? candidate.slice(7)
    : candidate;
  return isIP(normalized) ? normalized : null;
}
