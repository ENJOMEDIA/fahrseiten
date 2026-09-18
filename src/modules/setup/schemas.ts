import { isIP } from "node:net";

import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Bitte eine sechsstellige Hex-Farbe angeben.");

const optionalLegalText = z.string().trim().max(200).optional();
const databaseHost = z
  .string()
  .trim()
  .min(1)
  .max(253)
  .refine(
    (value) =>
      isIP(value) > 0 ||
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(
        value,
      ),
    "Ungültiger Datenbankhost.",
  );
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
  databaseHost,
  databasePort: z.coerce.number().int().min(1).max(65_535),
  databaseName: z.string().trim().min(1).max(64),
  databaseUser: z.string().trim().min(1).max(128),
  databasePassword: z.string().min(1).max(500),
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

export const tenantOnboardingSchema = z
  .object({
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
    billingUseLocationAddress: z.preprocess(
      (value) =>
        value === undefined ? true : value === true || value === "on",
      z.boolean(),
    ),
    billingCompanyName: z.string().trim().max(180).optional(),
    billingRecipientName: z.string().trim().max(160).optional(),
    billingEmail: z.union([z.literal(""), z.email()]).optional(),
    billingStreet: z.string().trim().max(180).optional(),
    billingPostalCode: z.string().trim().max(20).optional(),
    billingCity: z.string().trim().max(120).optional(),
    billingCountry: z.string().trim().max(120).optional(),
    ...legalFields,
  })
  .superRefine((value, context) => {
    if (value.billingUseLocationAddress) return;
    const required = [
      ["billingCompanyName", value.billingCompanyName],
      ["billingEmail", value.billingEmail],
      ["billingStreet", value.billingStreet],
      ["billingPostalCode", value.billingPostalCode],
      ["billingCity", value.billingCity],
      ["billingCountry", value.billingCountry],
    ] as const;
    for (const [field, fieldValue] of required)
      if (!fieldValue)
        context.addIssue({
          code: "custom",
          path: [field],
          message: "Bitte die vollständige Rechnungsanschrift angeben.",
        });
  });

export type PlatformSetupInput = z.infer<typeof platformSetupSchema>;
export type TenantOnboardingInput = z.infer<typeof tenantOnboardingSchema>;
