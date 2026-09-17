import { redirect } from "next/navigation";

import { AppShell, Breadcrumbs } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { logoutAction } from "@/modules/auth/actions";
import { getSessionIdentity } from "@/modules/auth/session";

export default async function PlatformAdminPlaceholder() {
  const identity = await getSessionIdentity();
  if (!identity?.platformRole) redirect("/login");
  return (
    <AppShell
      eyebrow="Plattformverwaltung"
      navigation={[
        { href: "/admin", label: "Übersicht", current: true },
        { href: "/admin/mandanten", label: "Mandanten" },
        { href: "/admin/akquise", label: "Akquise" },
        { href: "/admin/support", label: "Support" },
      ]}
      title={identity.displayName}
    >
      <Breadcrumbs items={[{ label: "Plattform" }, { label: "Übersicht" }]} />
      <h1 className="mt-6 text-3xl font-semibold text-slate-950">
        Plattform-Admin
      </h1>
      <Card className="mt-6">
        <p className="text-slate-600">
          Die Plattformfunktionen folgen in Phase 13.
        </p>
      </Card>
      <form action={logoutAction} className="mt-8">
        <button
          className="rounded-xl border border-slate-300 bg-white px-4 py-2"
          type="submit"
        >
          Abmelden
        </button>
      </form>
    </AppShell>
  );
}
