import { redirect } from "next/navigation";

import { logoutAction } from "@/modules/auth/actions";
import { getSessionIdentity } from "@/modules/auth/session";

export default async function CustomerAdminPlaceholder() {
  const identity = await getSessionIdentity();
  if (!identity || identity.memberships.length === 0) redirect("/login");
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16">
      <p className="text-sm font-semibold text-cyan-700">
        Lokaler Anwendungskontext
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-slate-950">
        Kunden-Admin
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Angemeldet als {identity.displayName}
      </p>
      <p className="mt-5 max-w-2xl text-slate-600">
        Der Zugriff wurde über eine aktive Mandantenmitgliedschaft geprüft.
      </p>
      <form action={logoutAction} className="mt-8">
        <button
          className="rounded-xl border border-slate-300 px-4 py-2"
          type="submit"
        >
          Abmelden
        </button>
      </form>
    </main>
  );
}
