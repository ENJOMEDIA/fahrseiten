import { NextRequest, NextResponse } from "next/server";

import { normalizeHostname } from "@/modules/domains/hostname";

function hosts(value: string | undefined, fallback: string): string[] {
  return (value ?? fallback)
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
}

const applicationPaths = [
  "/login",
  "/passwort-vergessen",
  "/passwort-zuruecksetzen",
  "/admin",
  "/kunde",
] as const;

export function isApplicationPath(pathname: string) {
  return applicationPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function proxy(request: NextRequest) {
  let hostname: string;
  try {
    hostname = normalizeHostname(request.headers.get("host") ?? "");
  } catch {
    return new NextResponse("Ungültiger Hostname", { status: 400 });
  }

  const marketingHosts = hosts(
    process.env.MARKETING_HOSTS,
    "localhost,127.0.0.1,fahrseiten.de,www.fahrseiten.de",
  );
  const appHosts = hosts(
    process.env.APP_HOSTS,
    "app.localhost,app.fahrseiten.de",
  );
  const demoHosts = hosts(
    process.env.DEMO_HOSTS,
    "demo.localhost,demo.fahrseiten.de,demo.fahrseiten.local",
  );
  if (marketingHosts.includes(hostname) || appHosts.includes(hostname))
    return NextResponse.next();

  if (isApplicationPath(request.nextUrl.pathname)) return NextResponse.next();

  const target = request.nextUrl.clone();
  if (demoHosts.includes(hostname)) {
    target.pathname =
      request.nextUrl.pathname === "/"
        ? "/demo"
        : `/demo${request.nextUrl.pathname}`;
    return NextResponse.rewrite(target);
  }

  target.pathname =
    request.nextUrl.pathname === "/"
      ? "/site"
      : `/site${request.nextUrl.pathname}`;
  return NextResponse.rewrite(target);
}

export const config = {
  matcher: ["/((?!api|media|_next/static|_next/image|favicon.ico).*)"],
};
