import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          XQueue
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/pricing" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">
            Pricing
          </Link>
          {session ? (
            <Link href="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">
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
