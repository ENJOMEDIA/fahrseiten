import { createHash, randomBytes } from "node:crypto";

export function createDomainVerificationToken(): {
  token: string;
  hash: string;
} {
  const token = `fahrseiten-${randomBytes(24).toString("base64url")}`;
  return { token, hash: hashDomainVerificationToken(token) };
}

export function hashDomainVerificationToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
