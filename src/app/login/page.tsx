import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionIdentity } from "@/modules/auth/session";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const identity = await getSessionIdentity();
  if (identity) redirect(identity.platformRole ? "/admin" : "/kunde");
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold tracking-[0.18em] text-cyan-700 uppercase">
        FahrSeiten
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Sicher anmelden
      </h1>
      <p className="mt-4 text-slate-600">
        Verwende ausschließlich deine lokalen Demo-Zugangsdaten.
      </p>
      <LoginForm />
      <Link
        className="mt-5 text-center text-sm text-cyan-800 underline"
        href="/passwort-vergessen"
      >
        Passwort vergessen
      </Link>
    </main>
  );
}
