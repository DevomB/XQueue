import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <BrandLogo />
        <nav className="flex items-center gap-5 text-sm">
          <Link
            href="/#features"
            className="hidden text-zinc-400 transition-colors hover:text-white sm:block"
          >
            Features
          </Link>
          <Link
            href="/#faq"
            className="hidden text-zinc-400 transition-colors hover:text-white sm:block"
          >
            FAQ
          </Link>
          <Link
            href="/pricing"
            className="text-zinc-400 transition-colors hover:text-white"
          >
            Pricing
          </Link>
          {session ? (
            <Link href="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-zinc-400 transition-colors hover:text-white"
              >
                Log in
              </Link>
              <Link href="/signup">
                <Button size="sm">Start free</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
