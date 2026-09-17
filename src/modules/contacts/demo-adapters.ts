import "server-only";
import type {
  NotificationRequest,
  NotificationPort,
} from "@/modules/notifications/port";
import type {
  InquiryRateLimiter,
  InquiryRecord,
  InquiryRepository,
} from "./service";

const demoState = globalThis as typeof globalThis & {
  demoInquiries?: InquiryRecord[];
  demoNotificationKeys?: Set<string>;
  demoRateLimits?: Map<string, number[]>;
  demoNotifications?: NotificationRequest[];
};
const rows = (demoState.demoInquiries ??= []);
const notificationKeys = (demoState.demoNotificationKeys ??= new Set<string>());
const attempts = (demoState.demoRateLimits ??= new Map<string, number[]>());
export const demoNotifications = (demoState.demoNotifications ??= []);

export const demoInquiryRepository: InquiryRepository = {
  async create(record) {
    rows.push(record);
  },
  async markNotificationQueued(tenantId, inquiryId) {
    const key = `${tenantId}:${inquiryId}`;
    if (notificationKeys.has(key)) return false;
    notificationKeys.add(key);
    return true;
  },
};
export const demoNotificationPort: NotificationPort = {
  async enqueue(request) {
    if (
      !demoNotifications.some(
        (item) => item.idempotencyKey === request.idempotencyKey,
      )
    )
      demoNotifications.push(request);
  },
};
export const demoInquiryRateLimiter: InquiryRateLimiter = {
  async allow(key) {
    const now = Date.now();
    const recent = (attempts.get(key) ?? []).filter(
      (value) => now - value < 15 * 60_000,
    );
    if (recent.length >= 5) return false;
    recent.push(now);
    attempts.set(key, recent);
    return true;
  },
};
