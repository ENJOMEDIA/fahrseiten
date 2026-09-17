export function priceToCents(value: string): number | null {
  if (!value) return null;
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized))
    throw new Error(
      "Bitte einen gültigen Preis mit höchstens zwei Nachkommastellen eingeben.",
    );
  const cents = Math.round(Number(normalized) * 100);
  if (!Number.isSafeInteger(cents) || cents > 10_000_000)
    throw new Error("Der eingegebene Preis ist zu hoch.");
  return cents;
}

export function formatEuro(cents: number | null) {
  if (cents === null) return "Preis auf Anfrage";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
