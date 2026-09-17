import "server-only";

import { cookies } from "next/headers";

import {
  createDatabaseSession,
  deleteDatabaseSession,
  findSessionIdentity,
} from "./repository";
import { createOpaqueToken, hashToken } from "./tokens";

const SESSION_TTL_MS = 12 * 60 * 60_000;
const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-fahrseiten_session"
    : "fahrseiten_session";

export async function startSession(userId: string): Promise<void> {
  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await createDatabaseSession(userId, hashToken(token), expiresAt);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await deleteDatabaseSession(hashToken(token));
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionIdentity() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  return findSessionIdentity(hashToken(token));
}
