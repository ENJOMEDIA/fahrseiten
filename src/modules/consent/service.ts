import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { CONSENT_VERSION, consentChoicesSchema } from "./model";

const evidenceSchema = z.object({
  subjectId: z.uuid(),
  noticeVersion: z.literal(CONSENT_VERSION),
  choices: consentChoicesSchema,
  withdrawn: z.boolean().default(false),
});

export type ConsentEvidence = {
  id: string;
  subjectHash: string;
  noticeVersion: string;
  choices: z.infer<typeof consentChoicesSchema>;
  sourceHost: string;
  withdrawnAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
};

export interface ConsentEvidenceRepository {
  create(evidence: ConsentEvidence): Promise<void>;
}

export async function recordConsentEvidence(
  raw: unknown,
  sourceHost: string,
  repository: ConsentEvidenceRepository,
  now = new Date(),
) {
  const input = evidenceSchema.parse(raw);
  const evidence: ConsentEvidence = {
    id: randomUUID(),
    subjectHash: createHash("sha256").update(input.subjectId).digest("hex"),
    noticeVersion: input.noticeVersion,
    choices: input.choices,
    sourceHost: sourceHost.toLowerCase().slice(0, 253),
    withdrawnAt: input.withdrawn ? now : null,
    expiresAt: new Date(now.getTime() + 180 * 24 * 60 * 60_000),
    createdAt: now,
  };
  await repository.create(evidence);
  return { id: evidence.id };
}
