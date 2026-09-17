import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-6 py-24">
      <h1 className="text-4xl font-semibold">Neues Passwort festlegen</h1>
      <p className="mt-4 text-slate-600">
        Der Link kann nur einmal und innerhalb seiner Laufzeit verwendet werden.
      </p>
      <ResetPasswordForm token={token} />
    </main>
  );
}
