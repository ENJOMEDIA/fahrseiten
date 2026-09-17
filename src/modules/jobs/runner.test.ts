import { describe, expect, it, vi } from "vitest";
import { runDueJobs, type JobRecord, type JobRepository } from "./runner";
function repository(job: JobRecord): JobRepository & {
  complete: ReturnType<typeof vi.fn>;
  retry: ReturnType<typeof vi.fn>;
  fail: ReturnType<typeof vi.fn>;
} {
  return {
    async claimDue() {
      return [job];
    },
    complete: vi.fn(async () => {}),
    retry: vi.fn(async () => {}),
    fail: vi.fn(async () => {}),
  };
}
const job: JobRecord = {
  id: "job-1",
  tenantId: "tenant-1",
  type: "notification",
  idempotencyKey: "key",
  payload: {},
  attempts: 0,
  maxAttempts: 3,
};
describe("job runner", () => {
  it("completes a successful job once", async () => {
    const repo = repository(job);
    const handler = vi.fn(async () => {});
    expect(await runDueJobs(repo, handler)).toMatchObject({
      claimed: 1,
      completed: 1,
    });
    expect(repo.complete).toHaveBeenCalledOnce();
  });
  it("schedules bounded retries without storing sensitive error messages", async () => {
    const repo = repository(job);
    await runDueJobs(
      repo,
      async () => {
        throw new TypeError("secret value");
      },
      new Date("2026-01-01T00:00:00Z"),
    );
    expect(repo.retry).toHaveBeenCalledWith(
      "job-1",
      1,
      new Date("2026-01-01T00:01:00Z"),
      "TypeError",
    );
  });
  it("marks the final attempt failed", async () => {
    const repo = repository({ ...job, attempts: 2 });
    await runDueJobs(repo, async () => {
      throw new Error("no");
    });
    expect(repo.fail).toHaveBeenCalledWith("job-1", 3, "Error");
  });
});
