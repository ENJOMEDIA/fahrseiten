import "server-only";
import { env } from "@/config/env";
import { dbJobRepository } from "@/modules/jobs/db-repository";
import { runDueJobs } from "@/modules/jobs/runner";
import { deliverEmailJob } from "./delivery";
import { dbDeliveryRepository } from "./db-delivery-repository";
import { CatchMailTransport, SmtpMailTransport } from "./mail-transport";
import { processMediaJob } from "@/modules/media/processing";
import { db } from "@/db/client";
import { consentRecords, trafficHourly } from "@/db/schema";
import { lt } from "drizzle-orm";
import { syncPostalDispatchStatuses } from "@/modules/onlinebrief/service";

const catchTransport = new CatchMailTransport();
const transport =
  env.SMTP_MODE === "smtp"
    ? new SmtpMailTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        user: env.SMTP_USER,
        password: env.SMTP_PASSWORD,
      })
    : catchTransport;
export async function runNotificationScheduler() {
  const result = await runDueJobs(dbJobRepository, async (job) => {
    if (job.type === "notification")
      return deliverEmailJob(job, dbDeliveryRepository, transport);
    if (job.type === "media_optimize") return processMediaJob(job);
    throw new Error("UnsupportedJobType");
  });
  const retentionLimit = new Date(Date.now() - 90 * 86_400_000);
  await db.delete(trafficHourly).where(lt(trafficHourly.hour, retentionLimit));
  await db
    .delete(consentRecords)
    .where(lt(consentRecords.expiresAt, new Date()));
  const postal = await syncPostalDispatchStatuses();
  return { ...result, postal };
}
