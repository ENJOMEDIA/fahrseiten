export function requirePostalSendConfirmation(confirmed: boolean) {
  if (!confirmed)
    throw new Error(
      "Bitte bestätige vor der Übertragung, dass Empfänger, Anschrift und PDF geprüft wurden.",
    );
}
