import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
            X post scheduler
          </p>
          <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
            Queue your X posts. Publish on time.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Paste a batch of X posts, set the times, and close your browser.
            XQueue publishes automatically via the official X API — no sketchy
            extensions, no tab left open at 2 AM.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg">Start free — 10 posts/month</Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="secondary">
                See pricing
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-zinc-200 bg-zinc-50 py-20 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
            <Feature
              title="Bulk paste queue"
              description="Drop in dozens of posts at once. YYYY-MM-DD HH:mm | your text — done."
            />
            <Feature
              title="Browser closed? No problem."
              description="A cloud worker fires at schedule time. You don't need to be online."
            />
            <Feature
              title="Official X API"
              description="OAuth-connected, policy-compliant posting. Not DOM automation."
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-950 p-8 text-white dark:border-zinc-800">
            <h2 className="text-2xl font-bold">How it works</h2>
            <ol className="mt-6 space-y-4 text-zinc-300">
              <li>1. Sign up and connect your X account (OAuth)</li>
              <li>2. Paste or compose posts with scheduled times</li>
              <li>3. Close the tab — XQueue publishes on schedule</li>
            </ol>
            <Link href="/signup" className="mt-8 inline-block">
              <Button>Get started</Button>
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/acceptable-use">Acceptable Use</Link>
          <Link href="/security">Security</Link>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} XQueue</p>
      </footer>
    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}
