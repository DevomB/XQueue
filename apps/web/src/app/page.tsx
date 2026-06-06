import Link from "next/link";
import {
  CalendarClock,
  Cloud,
  Layers,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0" />
        <div className="glow-orb absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2" />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 text-center md:pt-28">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 text-xs text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            Official X API · No browser tab required
          </div>
          <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
            Queue posts.
            <span className="block bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
              Publish on time.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Paste a batch of X posts, set the times, close your laptop. XQueue
            publishes automatically — even at 2 AM.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg">Start free — 10 posts/mo</Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="secondary">
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-2 font-mono text-xs text-zinc-500">
              bulk-paste.txt
            </span>
          </div>
          <pre className="overflow-x-auto p-6 font-mono text-sm leading-relaxed text-zinc-300">
{`2026-06-10 09:00 | Morning thread hook 🧵
2026-06-10 14:00 | Product update goes live
2026-06-10 18:30 | End-of-day recap

# drafts without a time stay in your queue`}
          </pre>
          <div className="border-t border-zinc-800 bg-zinc-950/50 px-6 py-4 text-sm text-zinc-500">
            → Scheduled · Worker publishes · Browser closed ✓
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-800 bg-zinc-900/30 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Layers}
            title="Bulk paste queue"
            description="Drop dozens of posts at once. YYYY-MM-DD HH:mm | your text — done."
          />
          <FeatureCard
            icon={Cloud}
            title="Browser closed? Fine."
            description="A cloud worker fires at schedule time. You don't need to be online."
          />
          <FeatureCard
            icon={Shield}
            title="Official X API"
            description="OAuth-connected and policy-compliant. Not DOM automation."
          />
          <FeatureCard
            icon={CalendarClock}
            title="Timezone-aware"
            description="Schedule in your local time. We store UTC and publish precisely."
          />
          <FeatureCard
            icon={Zap}
            title="Failure alerts"
            description="Get emailed if a post fails, with one-click retry in your dashboard."
          />
          <FeatureCard
            icon={Sparkles}
            title="Free tier included"
            description="10 text posts per month free. Upgrade to Pro for images and volume."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-transparent p-10 text-center md:p-14">
          <h2 className="text-3xl font-bold">Ready to queue up?</h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-400">
            Connect your X account, paste your posts, and let XQueue handle the
            rest.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="lg">Create free account</Button>
          </Link>
          <p className="mt-6 text-xs text-zinc-500">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-sky-400 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-sky-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition-colors hover:border-zinc-700">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        {description}
      </p>
    </div>
  );
}
