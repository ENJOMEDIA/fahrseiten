const PLACEHOLDER_MARKERS = [
  "replace-with",
  "change-me",
  "example",
  "local_only",
];

function hasPlaceholder(value) {
  const normalized = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker));
}

function parseHostList(value) {
  return value
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

export function validateProductionEnvironment(source = process.env) {
  const errors = [];

  if (source.NODE_ENV !== "production") {
    errors.push("NODE_ENV muss production sein.");
  }

  try {
    const baseUrl = new URL(source.APP_BASE_URL ?? "");
    if (baseUrl.protocol !== "https:") {
      errors.push("APP_BASE_URL muss eine HTTPS-URL sein.");
    }
  } catch {
    errors.push("APP_BASE_URL muss eine gültige HTTPS-URL sein.");
  }

  try {
    const databaseUrl = new URL(source.DATABASE_URL ?? "");
    if (databaseUrl.protocol !== "mysql:") {
      errors.push("DATABASE_URL muss das mysql-Protokoll verwenden.");
    }
    if (hasPlaceholder(source.DATABASE_URL ?? "")) {
      errors.push("DATABASE_URL enthält einen erkennbaren Platzhalter.");
    }
  } catch {
    errors.push("DATABASE_URL muss eine gültige MySQL-Verbindungs-URL sein.");
  }

  if (source.DEMO_DATA_MODE !== "database") {
    errors.push("DEMO_DATA_MODE muss im Plesk-Betrieb database sein.");
  }

  if (!parseHostList(source.MARKETING_HOSTS ?? "").includes("fahrseiten.de")) {
    errors.push("MARKETING_HOSTS muss fahrseiten.de enthalten.");
  }

  if (!parseHostList(source.APP_HOSTS ?? "").includes("app.fahrseiten.de")) {
    errors.push("APP_HOSTS muss app.fahrseiten.de enthalten.");
  }

  if (
    !source.CRON_SECRET ||
    source.CRON_SECRET.length < 24 ||
    hasPlaceholder(source.CRON_SECRET)
  ) {
    errors.push(
      "CRON_SECRET muss ein zufälliger Wert mit mindestens 24 Zeichen sein.",
    );
  }

  if (source.SMTP_MODE !== "smtp") {
    errors.push("SMTP_MODE muss im Plesk-Betrieb smtp sein.");
  }

  if (
    !source.SMTP_HOST ||
    ["localhost", "127.0.0.1"].includes(source.SMTP_HOST.toLowerCase()) ||
    hasPlaceholder(source.SMTP_HOST)
  ) {
    errors.push("SMTP_HOST muss ein realer SMTP-Host sein.");
  }

  const smtpPort = Number(source.SMTP_PORT);
  if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65_535) {
    errors.push("SMTP_PORT muss ein gültiger Port sein.");
  }

  if (!source.SMTP_USER || !source.SMTP_PASSWORD) {
    errors.push("SMTP_USER und SMTP_PASSWORD müssen gesetzt sein.");
  }

  if (!source.SMTP_FROM || source.SMTP_FROM.includes(".local")) {
    errors.push(
      "SMTP_FROM muss eine reale, freigegebene Absenderadresse sein.",
    );
  }

  return errors;
}
