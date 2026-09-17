import "server-only";
import { env } from "@/config/env";
import { dbJobRepository } from "@/modules/jobs/db-repository";
import { runDueJobs } from "@/modules/jobs/runner";
import { deliverEmailJob } from "./delivery";
import { dbDeliveryRepository } from "./db-delivery-repository";
import { CatchMailTransport, SmtpMailTransport } from "./mail-transport";

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
  return runDueJobs(dbJobRepository, async (job) => {
    if (job.type !== "notification") throw new Error("UnsupportedJobType");
    await deliverEmailJob(job, dbDeliveryRepository, transport);
  });
}
