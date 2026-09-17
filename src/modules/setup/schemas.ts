import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Bitte eine sechsstellige Hex-Farbe angeben.");

const optionalLegalText = z.string().trim().max(200).optional();
const legalFields = {
  legalForm: optionalLegalText,
  registerCourt: optionalLegalText,
  registerNumber: optionalLegalText,
  vatId: optionalLegalText,
  supervisoryAuthority: optionalLegalText,
  editorialResponsible: optionalLegalText,
  privacyContactEmail: z.union([z.literal(""), z.email()]).optional(),
  hostingProvider: z.string().trim().min(2).max(200),
};

export const platformSetupSchema = z.object({
  installToken: z.string().min(32).max(300),
  brandName: z.string().trim().min(2).max(160),
  companyName: z.string().trim().min(2).max(160),
  ownerName: z.string().trim().min(2).max(160),
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(12).max(200),
  phone: z.string().trim().max(40).optional(),
  street: z.string().trim().min(3).max(180),
  postalCode: z.string().trim().min(3).max(20),
  city: z.string().trim().min(2).max(120),
  primaryColor: hexColor,
  accentColor: hexColor,
  maintenanceMessage: z.string().trim().min(10).max(500),
  ...legalFields,
});

export const tenantOnboardingSchema = z.object({
  token: z.string().min(32).max(300),
  companyName: z.string().trim().min(2).max(160),
  ownerName: z.string().trim().min(2).max(160),
  ownerEmail: z.email().transform((value) => value.trim().toLowerCase()),
  ownerPassword: z.string().min(12).max(200),
  phone: z.string().trim().max(40).optional(),
  street: z.string().trim().min(3).max(180),
  postalCode: z.string().trim().min(3).max(20),
  city: z.string().trim().min(2).max(120),
  domain: z.string().trim().min(3).max(253),
  primaryColor: hexColor,
  accentColor: hexColor,
  maintenanceMessage: z.string().trim().min(10).max(500),
  ...legalFields,
});

export type PlatformSetupInput = z.infer<typeof platformSetupSchema>;
export type TenantOnboardingInput = z.infer<typeof tenantOnboardingSchema>;
