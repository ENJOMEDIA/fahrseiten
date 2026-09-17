import { domainToASCII } from "node:url";

export class InvalidHostnameError extends Error {
  constructor() {
    super("Der Hostname ist ungültig.");
    this.name = "InvalidHostnameError";
  }
}

export function normalizeHostname(value: string): string {
  const first = value.split(",", 1)[0]?.trim().toLowerCase() ?? "";
  if (
    !first ||
    first.includes("/") ||
    first.includes("@") ||
    first.includes("\\")
  ) {
    throw new InvalidHostnameError();
  }

  const withoutPort = first.startsWith("[")
    ? first.replace(/^\[([^\]]+)](?::\d+)?$/, "$1")
    : first.replace(/:\d+$/, "");
  const ascii = domainToASCII(withoutPort.replace(/\.$/, ""));
  if (
    !ascii ||
    ascii.length > 253 ||
    ascii.split(".").some((label) => !label || label.length > 63)
  ) {
    throw new InvalidHostnameError();
  }
  return ascii;
}

export function selectRequestHostname(input: {
  host: string | null;
  forwardedHost: string | null;
  trustProxyHeaders: boolean;
}): string {
  const selected =
    input.trustProxyHeaders && input.forwardedHost
      ? input.forwardedHost
      : input.host;
  if (!selected) throw new InvalidHostnameError();
  return normalizeHostname(selected);
}
