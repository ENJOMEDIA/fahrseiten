import { redirect } from "next/navigation";

import { AppShell, Breadcrumbs } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { logoutAction } from "@/modules/auth/actions";
import { getSessionIdentity } from "@/modules/auth/session";

export default async function CustomerAdminPlaceholder() {
  const identity = await getSessionIdentity();
  if (!identity || identity.memberships.length === 0) redirect("/login");
  return (
    <AppShell
      eyebrow="Kundenverwaltung"
      navigation={[
        { href: "/kunde", label: "Dashboard", current: true },
        { href: "/kunde/website", label: "Website" },
        { href: "/kunde/inhalte", label: "Inhalte" },
        { href: "/kunde/anfragen", label: "Anfragen" },
        { href: "/kunde/einstellungen", label: "Einstellungen" },
      ]}
      title={identity.displayName}
    >
      <Breadcrumbs
        items={[{ label: "Kundenbereich" }, { label: "Dashboard" }]}
      />
      <h1 className="mt-6 text-3xl font-semibold text-slate-950">
        Kunden-Admin
      </h1>
      <Card className="mt-6">
        <p className="text-slate-600">
          Der Zugriff wurde über eine aktive Mandantenmitgliedschaft geprüft.
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
