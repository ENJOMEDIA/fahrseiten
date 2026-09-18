export type SignatureLevel = "simple" | "advanced" | "qualified";

export type CreateSignatureRequestInput = {
  requestId: string;
  contractNumber: string;
  documentSha256: string;
  document: Uint8Array;
  signer: {
    name: string;
    email: string;
  };
  returnUrl: string;
  webhookUrl: string;
  level: SignatureLevel;
};

export type CreatedSignatureRequest = {
  externalId: string;
  signingUrl: string;
  expiresAt: Date | null;
};

export type VerifiedSignatureEvent = {
  providerEventId: string;
  externalRequestId: string;
  type: "opened" | "signed" | "declined" | "expired" | "cancelled";
  occurredAt: Date;
  signedDocument?: Uint8Array;
  evidenceDocument?: Uint8Array;
};

/**
 * Anbietergrenze für einen eIDAS-Signaturdienst. Der konkrete Adapter muss
 * Authentifizierung, Timeouts und die Signaturprüfung von Webhooks übernehmen.
 */
export interface SignatureProvider {
  readonly key: string;
  createRequest(
    input: CreateSignatureRequestInput,
  ): Promise<CreatedSignatureRequest>;
  cancelRequest(externalId: string): Promise<void>;
  verifyWebhook(request: Request): Promise<VerifiedSignatureEvent>;
}

export class SignatureProviderNotConfiguredError extends Error {
  constructor() {
    super(
      "Es ist noch kein Signaturanbieter verbunden. Der Vertrag wurde sicher vorbereitet und kann nach Auswahl des Anbieters versendet werden.",
    );
    this.name = "SignatureProviderNotConfiguredError";
  }
}

export function getSignatureProvider(): SignatureProvider {
  const configured = process.env.SIGNATURE_PROVIDER ?? "disabled";
  if (configured !== "disabled")
    throw new Error(
      `Der konfigurierte Signaturanbieter „${configured}“ besitzt noch keinen installierten Adapter.`,
    );
  throw new SignatureProviderNotConfiguredError();
}
