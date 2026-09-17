import { ResetRequestForm } from "./reset-request-form";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-6 py-24">
      <h1 className="text-4xl font-semibold">Passwort zurücksetzen</h1>
      <p className="mt-4 text-slate-600">
        Die Antwort verrät nicht, ob ein Konto vorhanden ist.
      </p>
      <ResetRequestForm />
    </main>
  );
}
