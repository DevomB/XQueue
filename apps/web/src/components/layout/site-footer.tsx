import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";

const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_REPO ?? "https://github.com";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <BrandLogo />
          <p className="mt-3 max-w-xs text-sm text-zinc-500">
            Open-source bulk X post scheduler. Self-host on your infrastructure
            with your X API credentials.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="font-medium text-zinc-300">Project</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li>
                <Link href="/#features" className="hover:text-sky-400">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#deploy" className="hover:text-sky-400">
                  Self-host
                </Link>
              </li>
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-400"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-zinc-300">Docs</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li>
                <a
                  href={`${GITHUB_URL}/blob/main/docs/SELF_HOST.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-400"
                >
                  Self-host guide
                </a>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-sky-400">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-zinc-300">Community</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li>
                <a
                  href={`${GITHUB_URL}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-400"
                >
                  Issues
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} PostWave · MIT License · Not affiliated
        with X Corp.
      </div>
    </footer>
  );
}
