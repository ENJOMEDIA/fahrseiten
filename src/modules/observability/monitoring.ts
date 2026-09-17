import type { TechnicalLogEvent } from "./logger";

export interface MonitoringAdapter {
  capture(event: TechnicalLogEvent): Promise<void>;
  check(): Promise<{ status: "ok" | "degraded"; detail?: string }>;
}

export const localMonitoringAdapter: MonitoringAdapter = {
  async capture() {},
  async check() {
    return { status: "ok" };
  },
};
