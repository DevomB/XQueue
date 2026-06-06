import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-lg font-bold tracking-tight text-white">XQueue</p>
          <p className="mt-2 max-w-xs text-sm text-zinc-500">
            Schedule X posts in bulk. Close the tab — we publish on time.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="font-medium text-zinc-300">Product</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li>
                <Link href="/pricing" className="hover:text-sky-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-sky-400">
                  Sign up
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-sky-400">
                  Log in
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-zinc-300">Legal</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li>
                <Link href="/terms" className="hover:text-sky-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-sky-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use" className="hover:text-sky-400">
                  Acceptable Use
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-sky-400">
                  Security
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-zinc-300">Contact</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li>
                <a
                  href="mailto:Devom.b@yahoo.com"
                  className="hover:text-sky-400"
                >
                  Devom.b@yahoo.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} XQueue. Not affiliated with X Corp.
      </div>
    </footer>
  );
}
