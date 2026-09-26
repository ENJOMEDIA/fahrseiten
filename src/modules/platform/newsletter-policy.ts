export type NewsletterRecipientState = {
  email: string | null;
  emailPermission: string;
  emailPermissionEvidence: string | null;
  emailOptOutAt: Date | null;
};

export function newsletterRecipientBlockReason(
  recipient: NewsletterRecipientState,
) {
  if (!recipient.email) return "E-Mail-Adresse fehlt.";
  if (recipient.emailPermission !== "consent")
    return "Ausdrückliche Newsletter-Einwilligung fehlt.";
  if (!recipient.emailPermissionEvidence?.trim())
    return "Einwilligungsnachweis fehlt.";
  if (recipient.emailOptOutAt) return "Kontakt hat sich abgemeldet.";
  return null;
}
