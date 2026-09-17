export function resolveDashboardUrl(
  configuredBaseUrl: string | undefined,
  path = "/login",
) {
  if (!configuredBaseUrl) return path;
  return new URL(path, `${configuredBaseUrl.replace(/\/$/, "")}/`).toString();
}

export function dashboardUrl(path = "/login") {
  return resolveDashboardUrl(process.env.DASHBOARD_BASE_URL, path);
}
