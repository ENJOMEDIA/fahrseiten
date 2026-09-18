import { z } from "zod";

export const CONSENT_VERSION = "consent-v1";
export const CONSENT_COOKIE = "fs_consent";

export const consentChoicesSchema = z.object({
  necessary: z.literal(true),
  functional: z.boolean(),
  statistics: z.boolean(),
  marketing: z.boolean(),
});

export const consentStateSchema = z.object({
  version: z.string().regex(/^consent-v1-[a-z0-9]+$/),
  choices: consentChoicesSchema,
  savedAt: z.string().datetime(),
});

export type ConsentCategory = "functional" | "statistics" | "marketing";
export type ConsentChoices = z.infer<typeof consentChoicesSchema>;
export type ConsentState = z.infer<typeof consentStateSchema>;

export const necessaryOnly = {
  necessary: true,
  functional: false,
  statistics: false,
  marketing: false,
} as const;

export function consentNoticeVersion(
  services: readonly {
    category: ConsentCategory;
    label: string;
    services: string;
  }[],
) {
  const source = services
    .map(
      (service) => `${service.category}:${service.label}:${service.services}`,
    )
    .sort()
    .join("|");
  let hash = 5381;
  for (const character of source)
    hash = ((hash << 5) + hash) ^ character.charCodeAt(0);
  return `${CONSENT_VERSION}-${(hash >>> 0).toString(36)}`;
}

export function parseConsentCookie(
  value: string | undefined,
): ConsentState | null {
  if (!value) return null;
  try {
    const result = consentStateSchema.safeParse(
      JSON.parse(decodeURIComponent(value)),
    );
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function serializeConsent(state: ConsentState): string {
  return encodeURIComponent(JSON.stringify(state));
}

export function mayLoadOptional(
  state: ConsentState | null,
  category: ConsentCategory,
): boolean {
  return state?.choices[category] === true;
}
