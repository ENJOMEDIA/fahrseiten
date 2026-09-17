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
  version: z.literal(CONSENT_VERSION),
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
