import { randomUUID } from "node:crypto";

const sensitiveKey =
  /password|passwort|token|secret|authorization|cookie|email|phone|message|body|form/i;

export function createReferenceId() {
  return `FS-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function redactContext(
  input: Record<string, unknown>,
): Record<string, string | number | boolean | null> {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      if (sensitiveKey.test(key)) return [key, "[REDACTED]"];
      if (
        value === null ||
        ["string", "number", "boolean"].includes(typeof value)
      )
        return [key, typeof value === "string" ? value.slice(0, 300) : value];
      return [key, "[OMITTED]"];
    }),
  ) as Record<string, string | number | boolean | null>;
}

export type TechnicalLogEvent = {
  referenceId: string;
  level: "info" | "warning" | "error";
  event: string;
  context: Record<string, string | number | boolean | null>;
};

export function technicalLog(
  level: TechnicalLogEvent["level"],
  event: string,
  context: Record<string, unknown> = {},
): TechnicalLogEvent {
  const entry = {
    referenceId: createReferenceId(),
    level,
    event: event.slice(0, 120),
    context: redactContext(context),
  };
  const output = JSON.stringify(entry);
  if (level === "error") console.error(output);
  else if (level === "warning") console.warn(output);
  else console.info(output);
  return entry;
}
