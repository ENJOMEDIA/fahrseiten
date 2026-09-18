import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getSessionIdentity } from "@/modules/auth/session";
import { findPlatformSettings } from "@/modules/setup/platform-settings";
import { mediaPublicUrl } from "@/modules/media/public-url";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const identity = await getSessionIdentity();
  if (identity) redirect(identity.platformRole ? "/admin" : "/kunde");
  const settings = await findPlatformSettings();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <Link
        className="mb-8 inline-flex w-fit items-center gap-3 text-sm font-semibold text-slate-600 hover:text-slate-950"
        href="/"
      >
        ← Zurück zur Startseite
      </Link>
      {settings?.logoMediaId ? (
        <Image
          alt="FahrSeiten Logo"
          className="h-12 w-auto object-contain object-left"
          height={48}
          src={mediaPublicUrl(settings.logoMediaId)}
          unoptimized
          width={192}
        />
      ) : (
        <p className="text-sm font-semibold tracking-[0.18em] text-cyan-700 uppercase">
          FahrSeiten
        </p>
      )}
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Sicher anmelden
      </h1>
      <p className="mt-4 text-slate-600">
        Melde dich mit deinem persönlichen FahrSeiten-Zugang an.
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
