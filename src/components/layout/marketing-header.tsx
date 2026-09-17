import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between px-6">
        <Link className="font-semibold tracking-tight text-slate-950" href="/">
          FahrSeiten{" "}
          <span className="text-sm font-normal text-slate-500">
            by ENJO MEDIA
          </span>
        </Link>
        <nav
          aria-label="Marketing-Navigation"
          className="flex items-center gap-5 text-sm font-medium"
        >
          <Link
            className="hidden hover:text-cyan-700 sm:block"
            href="/designsystem"
          >
            Designsystem
          </Link>
          <Link
            className="rounded-full bg-slate-950 px-4 py-2 text-white"
            href="/login"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
