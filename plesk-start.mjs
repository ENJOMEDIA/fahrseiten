import { access, rm, writeFile } from "node:fs/promises";

const applicationEntry = new URL("./dist/plesk/app.mjs", import.meta.url);
const diagnosticFile = new URL("./plesk-startup-error.log", import.meta.url);

function redactSecrets(value) {
  let redacted = value;
  for (const name of [
    "SMTP_PASSWORD",
    "CRON_SECRET",
    "INSTALL_TOKEN",
    "DATABASE_URL",
  ]) {
    const secret = process.env[name];
    if (secret) redacted = redacted.replaceAll(secret, `[${name} REDACTED]`);
  }
  return redacted.replace(/mysql:\/\/[^@\s]+@/giu, "mysql://[REDACTED]@");
}

try {
  await access(applicationEntry);
  await rm(diagnosticFile, { force: true });
  await import(applicationEntry.href);
} catch (error) {
  const detail =
    error instanceof Error
      ? `${error.name}: ${error.message}\n${error.stack ?? ""}`
      : "Unbekannter Fehler beim Start der FahrSeiten-Anwendung.";
  const report = [
    `Zeitpunkt: ${new Date().toISOString()}`,
    `Node.js: ${process.version}`,
    `Arbeitsverzeichnis: ${process.cwd()}`,
    "",
    redactSecrets(detail),
    "",
  ].join("\n");

  await writeFile(diagnosticFile, report, { mode: 0o600 });
  console.error(report);
  process.exitCode = 1;
}
