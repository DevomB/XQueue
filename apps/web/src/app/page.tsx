import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Check,
  ClipboardPaste,
  Clock,
  Cloud,
  Github,
  Globe2,
  KeyRound,
  Layers,
  Lock,
  RefreshCw,
  Server,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Faq, type FaqItem } from "@/components/marketing/faq";
import { TweetCard } from "@/components/marketing/tweet-card";
import { Marquee } from "@/components/marketing/marquee";
import { Counter } from "@/components/marketing/counter";
import { InteractivePastePreview } from "@/components/marketing/interactive-paste-preview";

const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_REPO ?? "https://github.com";

const faqs: FaqItem[] = [
  {
    q: "Is PostWave free?",
    a: "Yes. PostWave is open source under the MIT license. Self-host it on your machine or your cloud account. You only pay for your own infrastructure and X API usage.",
  },
  {
    q: "Will this get my X account flagged?",
    a: "PostWave publishes through X's official API using OAuth — not browser automation. That is the sanctioned method third-party apps are expected to use.",
  },
  {
    q: "Do I need to keep my browser open?",
    a: "No. A background worker publishes queued posts at the scheduled time whether you are online or not.",
  },
  {
    q: "What's the bulk paste format?",
    a: "One post per line: YYYY-MM-DD HH:mm | your text. Lines without a timestamp stay as drafts.",
  },
  {
    q: "Why do link posts cost more on X?",
    a: "X charges more for posts containing URLs through its API (~$0.20 vs ~$0.015 for text). That cost goes to your X Developer account, not PostWave.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-sky-600 focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader />

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="grid-bg absolute inset-0" />
          <div className="glow-orb absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2" />
          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 text-center md:pt-28">
            <Reveal>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-auto inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                Open source · MIT License
                <Github className="h-3.5 w-3.5" />
              </a>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="font-display mx-auto mt-8 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
                Queue your posts.
                <span className="block text-beam">Publish on time, every time.</span>
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
                Bulk-schedule X posts through the official API. Self-host on Docker
                or deploy to your own AWS account — full control, no paywalls.
              </p>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="group">
                    <Github className="mr-2 h-4 w-4" />
                    View on GitHub
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </a>
                <Link href="/signup">
                  <Button size="lg" variant="secondary">
                    Try the app
                  </Button>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={240}>
              <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
                {["Official X API", "Bulk paste import", "Image posts"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-zinc-800 py-6">
          <Marquee
            items={[
              "Bulk paste import",
              "Official X API",
              "Timezone-aware",
              "Image posts",
              "Self-hostable",
              "Open source MIT",
            ]}
          />
        </section>

        {/* Product mock */}
        <section className="relative mx-auto -mt-4 max-w-6xl px-4 pb-16">
          <Reveal>
            <div className="relative grid gap-4 lg:grid-cols-5">
              <QueuePreview />
              <InteractivePastePreview />
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <Reveal>
            <div className="mb-8 flex flex-wrap justify-center gap-10 text-center">
              <div>
                <p className="font-display text-3xl font-semibold text-white">
                  <Counter to={1200} suffix="+" />
                </p>
                <p className="mt-1 text-xs text-zinc-500">Posts scheduled (illustrative)</p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold text-white">
                  <Counter to={99} suffix="%" />
                </p>
                <p className="mt-1 text-xs text-zinc-500">On-time delivery (illustrative)</p>
              </div>
            </div>
            <p className="mb-8 text-center text-xs text-zinc-600">
              Illustrative metrics for design purposes — not live production data.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <TweetCard
                name="Alex Rivera"
                handle="@alexbuilds"
                avatar="from-violet-500 to-purple-400"
                body="Finally a scheduler that doesn't need a browser tab open. Bulk paste + walk away."
                verified
              />
              <TweetCard
                name="Jordan Kim"
                handle="@jordancreates"
                avatar="from-amber-500 to-orange-400"
                body="Self-hosted PostWave on Docker in an afternoon. My queue, my infra, my rules."
              />
              <TweetCard
                name="Sam Ortiz"
                handle="@samops"
                avatar="from-emerald-500 to-teal-400"
                body="Official API only — no sketchy automation. Exactly what I wanted for batch posting."
                verified
              />
            </div>
            <p className="mt-6 text-center text-xs text-zinc-600">
              Illustrative testimonials — representative personas, not real individuals.
            </p>
          </Reveal>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-24">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="Three steps to a self-running feed"
              description="Paste, schedule, close the laptop. The worker handles the rest."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ClipboardPaste,
                step: "01",
                title: "Paste your posts",
                body: "Drop a batch with date, time, and text — or compose one at a time.",
              },
              {
                icon: CalendarClock,
                step: "02",
                title: "Set the schedule",
                body: "Timezone-aware scheduling publishes to the exact minute.",
              },
              {
                icon: Cloud,
                step: "03",
                title: "Close the laptop",
                body: "The BullMQ worker publishes via the official X API while you are offline.",
              },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 80}>
                <div className="h-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                  <span className="font-mono text-sm text-zinc-600">{s.step}</span>
                  <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-y border-zinc-800 bg-zinc-900/20 py-24">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <SectionHeading
                eyebrow="Features"
                title="Everything you need, nothing you don't"
              />
            </Reveal>
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Layers, title: "Bulk paste", desc: "Import dozens of posts in one paste." },
                { icon: Shield, title: "Official X API", desc: "OAuth-connected, policy-compliant." },
                { icon: Globe2, title: "Timezone-aware", desc: "Schedule in your local time." },
                { icon: Zap, title: "Failure alerts", desc: "Email on failure with one-click retry." },
                { icon: RefreshCw, title: "Drafts & edits", desc: "Tweak posts until they publish." },
                { icon: Server, title: "Self-hostable", desc: "Docker, AWS, Railway, or Fly.io." },
              ].map((f, i) => (
                <Reveal key={f.title} delay={i * 50}>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                    <f.icon className="h-5 w-5 text-sky-400" />
                    <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
                    <p className="mt-2 text-sm text-zinc-400">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Tech stack */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <Reveal>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 sm:grid-cols-3">
              <Stat value="Next.js 16" label="App Router + React 19" />
              <Stat value="BullMQ" label="Reliable scheduled publishing" />
              <Stat value="PostgreSQL" label="Posts, users, encrypted tokens" />
            </div>
          </Reveal>
        </section>

        {/* Deploy */}
        <section id="deploy" className="scroll-mt-20 border-y border-zinc-800 bg-zinc-900/20 py-24">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <SectionHeading
                eyebrow="Self-host"
                title="Run it on your infrastructure"
                description="All deploy options use your credentials and your accounts. You are the operator."
              />
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              <DeployCard
                icon={Terminal}
                title="Docker Compose"
                description="Fastest way to try locally. Postgres + Redis included."
                code={`git clone ${GITHUB_URL.replace("https://github.com/", "")}
docker compose up -d
pnpm install && pnpm db:push
pnpm dev && pnpm dev:worker`}
              />
              <DeployCard
                icon={Cloud}
                title="AWS"
                description="Terraform template for S3 uploads today; RDS, Redis, and ECS planned."
                href={`${GITHUB_URL}/tree/main/infra/deploy/aws`}
                linkLabel="View AWS template"
              />
              <DeployCard
                icon={Server}
                title="Railway / Fly.io"
                description="Use included configs for the worker. Pair with Vercel or your own web host."
                href={`${GITHUB_URL}/blob/main/docs/DEPLOYMENT.md`}
                linkLabel="Deployment guide"
              />
            </div>
            <p className="mt-8 text-center text-xs text-zinc-600">
              See{" "}
              <a href={`${GITHUB_URL}/blob/main/docs/SELF_HOST.md`} className="text-zinc-500 hover:text-sky-400">
                docs/SELF_HOST.md
              </a>{" "}
              for the full setup guide.{" "}
              <Link href="/disclaimer" className="text-zinc-500 hover:text-sky-400">
                Disclaimer
              </Link>
            </p>
          </div>
        </section>

        {/* Trust */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <h2 className="font-display text-3xl font-semibold text-white">
                Your credentials stay yours
              </h2>
              <p className="mt-4 text-zinc-400">
                OAuth-only X connection. Tokens encrypted at rest. Disconnect
                anytime. When you self-host, your data never leaves your infrastructure.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: KeyRound, t: "OAuth only", d: "We never see your password." },
                  { icon: Lock, t: "Encrypted tokens", d: "AES-256-GCM at rest." },
                  { icon: Shield, t: "Official API", d: "No browser automation." },
                  { icon: Clock, t: "Disconnect anytime", d: "Revoke in one click." },
                ].map((c) => (
                  <li key={c.t} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <c.icon className="h-5 w-5 text-sky-400" />
                    <p className="mt-3 text-sm font-semibold text-white">{c.t}</p>
                    <p className="mt-1 text-xs text-zinc-500">{c.d}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-t border-zinc-800 bg-zinc-900/20 py-24">
          <div className="mx-auto max-w-3xl px-4">
            <Reveal>
              <SectionHeading eyebrow="FAQ" title="Questions, answered straight" />
            </Reveal>
            <Reveal delay={80} className="mt-12">
              <Faq items={faqs} />
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-linear-to-br from-sky-500/10 via-zinc-950 to-zinc-950 p-10 text-center md:p-16">
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Star it. Fork it. Ship posts.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-zinc-400">
                Open-source bulk scheduling for X. Built with Next.js, BullMQ, and
                the official X API v2.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="lg">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </a>
                <Link href="/signup">
                  <Button size="lg" variant="secondary">
                    Try the app
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-zinc-950 px-6 py-10 text-center">
      <p className="font-display text-2xl font-semibold text-white md:text-3xl">
        {value}
      </p>
      <p className="mx-auto mt-3 max-w-60 text-sm text-zinc-500">{label}</p>
    </div>
  );
}

function DeployCard({
  icon: Icon,
  title,
  description,
  code,
  href,
  linkLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  code?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <Icon className="h-5 w-5 text-sky-400" />
      <h3 className="mt-4 font-semibold text-white">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-zinc-400">{description}</p>
      {code && (
        <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-900 p-3 font-mono text-xs text-zinc-400">
          {code}
        </pre>
      )}
      {href && linkLabel && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center text-sm text-sky-400 hover:underline"
        >
          {linkLabel}
          <ArrowRight className="ml-1 h-3 w-3" />
        </a>
      )}
    </div>
  );
}

function QueuePreview() {
  const rows = [
    { time: "Today · 09:00", text: "Morning thread hook", status: "published" },
    { time: "Today · 14:00", text: "Product update goes live", status: "published" },
    { time: "Today · 18:30", text: "End-of-day recap", status: "scheduled" },
  ] as const;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl lg:col-span-3">
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <span className="font-mono text-xs text-zinc-500">postwave · queue</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-400" />
          Worker live
        </span>
      </div>
      <ul className="divide-y divide-zinc-800/70">
        {rows.map((r) => (
          <li key={r.text} className="flex items-center gap-4 px-5 py-4">
            <span className="w-28 shrink-0 font-mono text-xs text-zinc-500">{r.time}</span>
            <span className="flex-1 truncate text-sm text-zinc-200">{r.text}</span>
            {r.status === "published" ? (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
                Published
              </span>
            ) : (
              <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs text-sky-400">
                Scheduled
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

