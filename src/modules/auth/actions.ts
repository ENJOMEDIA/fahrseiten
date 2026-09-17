"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { hashPassword } from "./password";
import { authRateLimiter } from "./rate-limit";
import {
  consumePasswordResetToken,
  createPasswordResetToken,
  findAuthUserByEmail,
  writeAuthAuditEvent,
} from "./repository";
import { authenticateWithPassword } from "./service";
import { endSession, getSessionIdentity, startSession } from "./session";
import { createOpaqueToken, hashToken } from "./tokens";

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const loginSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1).max(200),
});

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      status: "error",
      message: "E-Mail-Adresse oder Passwort ist ungültig.",
    };

  const rateKey = authRateLimiter.key("login", parsed.data.email);
  if (!authRateLimiter.isAllowed(rateKey)) {
    return {
      status: "error",
      message: "Zu viele Versuche. Bitte versuche es später erneut.",
    };
  }

  const user = await authenticateWithPassword({
    ...parsed.data,
    findUser: findAuthUserByEmail,
  });
  if (!user) {
    authRateLimiter.recordFailure(rateKey);
    return {
      status: "error",
      message: "E-Mail-Adresse oder Passwort ist ungültig.",
    };
  }

  authRateLimiter.clear(rateKey);
  await startSession(user.id);
  await writeAuthAuditEvent({ actorUserId: user.id, action: "auth.login" });
  redirect(user.platformRole ? "/admin" : "/kunde");
}

export async function logoutAction() {
  const identity = await getSessionIdentity();
  await endSession();
  await writeAuthAuditEvent({
    actorUserId: identity?.id,
    action: "auth.logout",
  });
  redirect("/login");
}

export async function requestPasswordResetAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = z.email().safeParse(formData.get("email"));
  if (email.success) {
    const user = await findAuthUserByEmail(email.data.trim().toLowerCase());
    if (user?.active) {
      const token = createOpaqueToken();
      await createPasswordResetToken(
        user.id,
        hashToken(token),
        new Date(Date.now() + 30 * 60_000),
      );
      // Die Zustellung des Klartext-Tokens wird in Phase 14 über die Notification-Schnittstelle ergänzt.
    }
  }
  return {
    status: "success",
    message:
      "Wenn ein aktives Konto existiert, wurde eine Rücksetzung vorbereitet.",
  };
}

export async function resetPasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = z
    .object({
      token: z.string().min(32).max(200),
      password: z.string().min(12).max(200),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", message: "Die Eingaben sind ungültig." };

  const changed = await consumePasswordResetToken(
    hashToken(parsed.data.token),
    await hashPassword(parsed.data.password),
  );
  if (changed)
    await writeAuthAuditEvent({ action: "auth.password_reset_completed" });
  return changed
    ? {
        status: "success",
        message: "Das Passwort wurde geändert. Du kannst dich anmelden.",
      }
    : { status: "error", message: "Der Link ist ungültig oder abgelaufen." };
}
