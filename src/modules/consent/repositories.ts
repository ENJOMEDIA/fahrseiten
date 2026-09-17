import "server-only";
import { db } from "@/db/client";
import { consentRecords } from "@/db/schema";
import type { ConsentEvidence, ConsentEvidenceRepository } from "./service";

const state = globalThis as typeof globalThis & {
  demoConsentEvidence?: ConsentEvidence[];
};

export const demoConsentEvidence = (state.demoConsentEvidence ??= []);

export const demoConsentRepository: ConsentEvidenceRepository = {
  async create(evidence) {
    demoConsentEvidence.push(evidence);
  },
};

export const dbConsentRepository: ConsentEvidenceRepository = {
  async create(evidence) {
    await db.insert(consentRecords).values({
      id: evidence.id,
      subjectHash: evidence.subjectHash,
      noticeVersion: evidence.noticeVersion,
      choices: evidence.choices,
      sourceHost: evidence.sourceHost,
      withdrawnAt: evidence.withdrawnAt,
      expiresAt: evidence.expiresAt,
      createdAt: evidence.createdAt,
    });
  },
};
