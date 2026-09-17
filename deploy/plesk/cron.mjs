async function main() {
  const baseUrl = process.env.APP_BASE_URL;
  const secret = process.env.CRON_SECRET;
  if (!baseUrl || !secret) {
    throw new Error("APP_BASE_URL oder CRON_SECRET fehlt.");
  }

  const endpoint = new URL("/api/cron", baseUrl);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Cron-Endpunkt antwortete mit HTTP ${response.status}.`);
  }

  const result = await response.json();
  console.info(
    `FahrSeiten-Cron erfolgreich: ${result.processed ?? 0} verarbeitet, ${result.failed ?? 0} fehlgeschlagen.`,
  );
}

main().catch((error) => {
  console.error(
    "FahrSeiten-Cron ist fehlgeschlagen:",
    error instanceof Error ? error.message : "Unbekannter Fehler",
  );
  process.exit(1);
});
