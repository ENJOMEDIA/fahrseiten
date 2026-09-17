export type JobRecord = {
  id: string;
  tenantId: string | null;
  type: string;
  idempotencyKey: string;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
};
export interface JobRepository {
  claimDue(now: Date, limit: number): Promise<JobRecord[]>;
  complete(id: string, now: Date): Promise<void>;
  retry(
    id: string,
    attempts: number,
    runAt: Date,
    errorCode: string,
  ): Promise<void>;
  fail(id: string, attempts: number, errorCode: string): Promise<void>;
}
export type JobHandler = (job: JobRecord) => Promise<void>;
const retryDelays = [60_000, 5 * 60_000, 30 * 60_000] as const;
export async function runDueJobs(
  repository: JobRepository,
  handler: JobHandler,
  now = new Date(),
  limit = 20,
) {
  const jobs = await repository.claimDue(now, limit);
  let completed = 0;
  let failed = 0;
  for (const job of jobs) {
    try {
      await handler(job);
      await repository.complete(job.id, now);
      completed += 1;
    } catch (error) {
      const attempts = job.attempts + 1;
      const errorCode = safeErrorCode(error);
      if (attempts >= job.maxAttempts) {
        await repository.fail(job.id, attempts, errorCode);
        failed += 1;
      } else {
        const delay =
          retryDelays[Math.min(attempts - 1, retryDelays.length - 1)];
        await repository.retry(
          job.id,
          attempts,
          new Date(now.getTime() + delay),
          errorCode,
        );
      }
    }
  }
  return { claimed: jobs.length, completed, failed };
}
function safeErrorCode(error: unknown) {
  const name = error instanceof Error ? error.name : "UnknownError";
  return name.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "UnknownError";
}
