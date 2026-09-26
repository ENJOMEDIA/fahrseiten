export const salesLeadTagSuggestions = [
  "Rechtlich veraltet",
  "Aktuelle Wartungen",
] as const;

export function parseSalesLeadTags(
  value: string | string[] | null | undefined,
): string[] {
  if (!value) return [];
  let values: string[];
  if (Array.isArray(value)) values = value;
  else {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        values = Array.isArray(parsed) ? parsed.map(String) : [trimmed];
      } catch {
        values = trimmed.split(/[|,]/);
      }
    } else values = trimmed.split(/[|,]/);
  }
  const normalized = values.map((tag) => tag.trim()).filter(Boolean);
  if (normalized.length > 12)
    throw new Error("Pro Kontakt sind höchstens 12 Tags erlaubt.");
  const unique = new Map<string, string>();
  for (const tag of normalized) {
    if (tag.length > 60)
      throw new Error("Ein Kontakt-Tag darf höchstens 60 Zeichen lang sein.");
    const suggestion = salesLeadTagSuggestions.find(
      (item) =>
        item.toLocaleLowerCase("de-DE") === tag.toLocaleLowerCase("de-DE"),
    );
    unique.set(tag.toLocaleLowerCase("de-DE"), suggestion ?? tag);
  }
  return [...unique.values()];
}

export function serializeSalesLeadTags(
  value: string | string[] | null | undefined,
) {
  const tags = parseSalesLeadTags(value);
  return tags.length ? JSON.stringify(tags) : null;
}
