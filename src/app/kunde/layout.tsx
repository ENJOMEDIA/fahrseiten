import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionIdentity } from "@/modules/auth/session";
import { customerNavigation } from "@/modules/customer/navigation";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getSessionIdentity();
  if (!identity || identity.memberships.length === 0) redirect("/login");
  return (
    <AppShell
      eyebrow="Kundenverwaltung"
      navigation={customerNavigation}
      title={identity.displayName}
    >
      {children}
    </AppShell>
  );
}
