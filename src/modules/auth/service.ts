import { verifyPassword } from "./password";
import type { AuthUser } from "./repository";

export async function authenticateWithPassword(input: {
  email: string;
  password: string;
  findUser: (email: string) => Promise<AuthUser | null>;
}): Promise<AuthUser | null> {
  const user = await input.findUser(input.email.trim().toLowerCase());
  if (!user?.active || !user.passwordHash) return null;
  return (await verifyPassword(input.password, user.passwordHash))
    ? user
    : null;
}
