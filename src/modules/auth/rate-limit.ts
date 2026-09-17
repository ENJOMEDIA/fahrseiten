import { createHash } from "node:crypto";

type Entry = { attempts: number; windowStart: number; blockedUntil: number };

export class AuthRateLimiter {
  readonly #entries = new Map<string, Entry>();

  constructor(
    private readonly limit = 5,
    private readonly windowMs = 15 * 60_000,
    private readonly blockMs = 15 * 60_000,
  ) {}

  key(action: string, identifier: string): string {
    return createHash("sha256")
      .update(`${action}:${identifier.toLowerCase()}`)
      .digest("hex");
  }

  isAllowed(key: string, now = Date.now()): boolean {
    const entry = this.#entries.get(key);
    return !entry || entry.blockedUntil <= now;
  }

  recordFailure(key: string, now = Date.now()): void {
    const current = this.#entries.get(key);
    const entry =
      !current || now - current.windowStart >= this.windowMs
        ? { attempts: 0, windowStart: now, blockedUntil: 0 }
        : current;
    entry.attempts += 1;
    if (entry.attempts >= this.limit) entry.blockedUntil = now + this.blockMs;
    this.#entries.set(key, entry);
  }

  clear(key: string): void {
    this.#entries.delete(key);
  }
}

export const authRateLimiter = new AuthRateLimiter();
