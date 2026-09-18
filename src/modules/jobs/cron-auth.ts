import { timingSafeEqual } from "node:crypto";

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function hasValidCronBearer(request: Request, secret?: string) {
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  return Boolean(secret && safeEqual(provided, secret));
}

export function hasValidCronUrlToken(request: Request, token?: string) {
  const provided = new URL(request.url).searchParams.get("token") ?? "";
  return Boolean(token && safeEqual(provided, token));
}
