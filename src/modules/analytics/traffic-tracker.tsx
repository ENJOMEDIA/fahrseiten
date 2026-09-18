"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { CONSENT_COOKIE, parseConsentCookie } from "@/modules/consent/model";

export function TrafficTracker({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  useEffect(() => {
    if (
      !enabled ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/kunde")
    )
      return;
    const raw = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`))
      ?.slice(CONSENT_COOKIE.length + 1);
    if (!parseConsentCookie(raw)?.choices.statistics) return;
    void fetch("/api/analytics/page-view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    });
  }, [enabled, pathname]);
  return null;
}
