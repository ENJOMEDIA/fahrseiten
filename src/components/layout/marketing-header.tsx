import Link from "next/link";

export function MarketingHeader() {
  const links = [
    ["Funktionen", "/funktionen"],
    ["Design & Demo", "/design"],
    ["Preise", "/preise"],
    ["FAQ", "/faq"],
    ["Beratung", "/kontakt"],
  ] as const;

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
          className="hidden items-center gap-4 text-sm font-medium md:flex"
        >
          {links.map(([label, href]) => (
            <Link className="hover:text-cyan-700" href={href} key={href}>
              {label}
            </Link>
          ))}
          <Link
            className="rounded-full bg-slate-950 px-4 py-2 text-white"
            href="/login"
          >
            Login
          </Link>
        </nav>
        <details className="relative md:hidden">
          <summary className="cursor-pointer rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">
            Menü
          </summary>
          <nav
            aria-label="Mobile Marketing-Navigation"
            className="absolute right-0 z-20 mt-2 grid min-w-52 gap-1 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-medium shadow-xl"
          >
            {links.map(([label, href]) => (
              <Link
                className="rounded-lg px-3 py-2 hover:bg-cyan-50"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
            <Link
              className="rounded-lg bg-slate-950 px-3 py-2 text-white"
              href="/login"
            >
              Login
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
