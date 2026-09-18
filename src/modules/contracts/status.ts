import type {
  contractDocumentStatusValues,
  signatureRequestStatusValues,
} from "@/db/schema";

export type SignatureRequestStatus =
  (typeof signatureRequestStatusValues)[number];
export type ContractDocumentStatus =
  (typeof contractDocumentStatusValues)[number];

const terminal = new Set<SignatureRequestStatus>([
  "signed",
  "declined",
  "expired",
  "cancelled",
]);

const transitions: Record<SignatureRequestStatus, SignatureRequestStatus[]> = {
  created: ["pending", "failed", "cancelled"],
  pending: ["opened", "signed", "declined", "expired", "cancelled", "failed"],
  opened: ["signed", "declined", "expired", "cancelled", "failed"],
  signed: [],
  declined: [],
  expired: [],
  cancelled: [],
  failed: ["pending", "cancelled"],
};

export function mayTransitionSignatureRequest(
  current: SignatureRequestStatus,
  next: SignatureRequestStatus,
) {
  return current === next || transitions[current].includes(next);
}

export function isTerminalSignatureStatus(status: SignatureRequestStatus) {
  return terminal.has(status);
}

export function contractStatusForSignature(
  status: SignatureRequestStatus,
): ContractDocumentStatus {
  switch (status) {
    case "signed":
      return "signed";
    case "declined":
      return "declined";
    case "expired":
      return "expired";
    case "cancelled":
      return "cancelled";
    case "created":
      return "prepared";
    default:
      return "sent";
  }
}
