import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Check,
  ClipboardPaste,
  Clock,
  Cloud,
  Globe2,
  KeyRound,
  Layers,
  Lock,
  RefreshCw,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";
import { Counter } from "@/components/marketing/counter";
import { Marquee } from "@/components/marketing/marquee";
import { SectionHeading } from "@/components/marketing/section-heading";
import { TweetCard, type Testimonial } from "@/components/marketing/tweet-card";
import { Faq, type FaqItem } from "@/components/marketing/faq";

const audiences = [
  "Indie founders",
  "Newsletter writers",
  "Build-in-public devs",
  "Solo creators",
  "Dev-tool teams",
  "Agencies & ghostwriters",
  "Community managers",
];

const testimonials: Testimonial[] = [
  {
    name: "Maya Okafor",
    handle: "@mayabuilds",
    avatar: "from-sky-500 to-cyan-400",
    verified: true,
    body: "I write my whole week of posts on Sunday night and forget about it. Woke up to my 6 AM hook already live with replies rolling in. This is the workflow I kept trying to hack together with reminders.",
  },
  {
    name: "Devon Reyes",
    handle: "@devonships",
    avatar: "from-violet-500 to-fuchsia-400",
      body: "Switched off a browser-extension scheduler that randomly died mid-day. PostWave runs on the official API so nothing breaks when I close the tab. Zero missed posts in two months.",
  },
  {
    name: "Priya Nair",
    handle: "@priyawrites",
    avatar: "from-emerald-500 to-teal-400",
    verified: true,
    body: "The bulk paste is the killer feature. I dump 20 posts with timestamps and it just queues them. Used to take me 30 minutes of copy-paste across tabs.",
  },
  {
    name: "Tomás Lindqvist",
    handle: "@tomas_dev",
    avatar: "from-amber-500 to-orange-400",
    body: "Timezone handling actually works. I travel a lot and my posts still go out at the right local time for my audience. Small thing that every other tool got wrong for me.",
  },
  {
    name: "Sarah Cole",
    handle: "@sarahcole",
    avatar: "from-rose-500 to-pink-400",
    body: "Got an email the one time a post failed (an expired token) with a retry button right there. Fixed it in 10 seconds. That alert alone is worth the subscription.",
  },
  {
    name: "Kenji Watanabe",
    handle: "@kenjimakes",
    avatar: "from-blue-500 to-indigo-400",
    verified: true,
    body: "It looks and feels like a tool built by someone who actually posts. No bloat, no 14 menus. Paste, schedule, done. Pricing is honest too.",
  },
];

const faqs: FaqItem[] = [
  {
    q: "Will this get my X account flagged or banned?",
    a: "No. PostWave publishes through X's official API using OAuth — the same sanctioned method X provides for third-party apps. We never automate the browser, scrape, or simulate clicks, which is what gets accounts in trouble.",
  },
  {
    q: "Do I need to keep my browser or laptop open?",
    a: "Never. Once a post is queued, PostWave publishes it at the scheduled time whether you're online, asleep, or on a plane. That's the whole point.",
  },
  {
    q: "How do you protect my account?",
    a: "We authenticate via OAuth, so we never see or store your X password. The access tokens we do hold are encrypted at rest, and you can disconnect your account at any time.",
  },
  {
    q: "What happens if a post fails to publish?",
    a: "You get an email alert immediately, and the post appears in your dashboard with a one-click retry. You're never silently dropped.",
  },
  {
    q: "What's the bulk paste format?",
    a: "One post per line as YYYY-MM-DD HH:mm | your text. Lines without a timestamp stay as drafts in your queue. Paste dozens at once and they're scheduled instantly.",
  },
  {
    q: "Why do posts with links cost more?",
    a: "X charges more for posts containing URLs through its API. We pass that through transparently (~$0.20/link post) instead of hiding it. Text-only posts are effectively free and included in your plan.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel in one click from settings — no email, no retention maze. You keep access until the end of your billing period.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0" />
        <div className="glow-orb absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 text-center md:pt-28">
          <Reveal>
            <Link
              href="/pricing"
              className="mx-auto inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
            >
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              Official X API · No browser tab required
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="font-display mx-auto mt-8 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              Queue your posts.
              <span className="block text-beam">Publish on time, every time.</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
              Batch a week of X posts in one sitting, set the times, and close your
              laptop. PostWave publishes automatically through the official API —
              even at 2 AM, even when you&apos;re offline.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="group">
                  Start free — 10 posts/mo
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="secondary">
                  View pricing
                </Button>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
              {["No credit card required", "Official X API", "Cancel anytime"].map(
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

      {/* ── Product mock ─────────────────────────────────────── */}
      <section className="relative mx-auto -mt-4 max-w-6xl px-4 pb-16">
        <Reveal>
          <div className="relative">
            <div className="dot-field absolute -inset-x-10 -inset-y-8" />
            <div className="relative grid gap-4 lg:grid-cols-5">
              <QueuePreview />
              <PastePreview />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Social proof strip ───────────────────────────────── */}
      <section className="border-y border-zinc-800/70 bg-zinc-900/20 py-8">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-zinc-600">
          Built for people who post on purpose
        </p>
        <Marquee items={audiences} />
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="Three steps to a self-running feed"
            description="No new habits to learn. If you can paste text, you can run your whole posting schedule."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: ClipboardPaste,
              step: "01",
              title: "Paste your posts",
              body: "Drop in a batch with one line each: a date, a time, and your text. Or add them one at a time — your call.",
            },
            {
              icon: CalendarClock,
              step: "02",
              title: "Set the schedule",
              body: "Pick times in your own timezone. PostWave handles the conversions and publishes to the exact minute, wherever you are.",
            },
            {
              icon: Cloud,
              step: "03",
          title: "Close the laptop",
            body: "PostWave publishes each post at its time through the official X API. You don't have to be online, awake, or anywhere near a screen.",
            },
          ].map((s, i) => (
            <Reveal key={s.step} delay={i * 80}>
              <div className="relative h-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
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

      {/* ── Feature bento ────────────────────────────────────── */}
      <section id="features" className="scroll-mt-20 border-y border-zinc-800 bg-zinc-900/20 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <SectionHeading
              eyebrow="Features"
              title="Everything you need, nothing you don't"
              description="A focused tool that does one job extremely well: getting the right post out at the right time."
            />
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-6">
            <Reveal className="md:col-span-4">
              <FeatureTile
                icon={Layers}
                title="Bulk paste queue"
                description="Drop dozens of posts at once in a dead-simple format. We parse the times and queue everything in seconds — no spreadsheet imports, no clunky modals."
                tall
              />
            </Reveal>
            <Reveal className="md:col-span-2" delay={60}>
              <FeatureTile
                icon={Shield}
                title="Official X API"
                description="OAuth-connected and policy-compliant. Not browser automation — so your account stays safe."
              />
            </Reveal>
            <Reveal className="md:col-span-2" delay={120}>
              <FeatureTile
                icon={Globe2}
                title="Timezone-aware"
                description="Schedule in your local time. We publish to the exact minute, wherever you are."
              />
            </Reveal>
            <Reveal className="md:col-span-2" delay={60}>
              <FeatureTile
                icon={Zap}
                title="Failure alerts"
                description="Email the moment a post fails, with one-click retry waiting in your dashboard."
              />
            </Reveal>
            <Reveal className="md:col-span-2" delay={120}>
              <FeatureTile
                icon={RefreshCw}
                title="Drafts & edits"
                description="Posts without a time stay as drafts. Tweak text or timing right up until they fire."
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Stats band ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 sm:grid-cols-3">
            <Stat
              value={<Counter to={30} prefix="±" suffix="s" />}
              label="Publish accuracy vs. your scheduled time"
            />
            <Stat
              value={<Counter to={100} suffix="%" />}
              label="Posts sent through the official X API"
            />
            <Stat
              value={
                <>
                  24<span className="text-sky-400">/</span>7
                </>
              }
              label="Always-on publishing — runs while you sleep"
            />
          </div>
        </Reveal>
        <p className="mt-4 text-center text-xs text-zinc-600">
          Figures describe how PostWave works, not traction claims. See{" "}
          <Link href="/security" className="text-zinc-500 underline-offset-2 hover:underline">
            how we keep you safe
          </Link>
          .
        </p>
      </section>

      {/* ── Trust / security strip ───────────────────────────── */}
      <section className="border-y border-zinc-800 bg-zinc-900/20 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-widest text-sky-400">
                Built to be trusted
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Your account&apos;s safety isn&apos;t an afterthought
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400">
                Most schedulers cut corners with browser automation that can get
                your account limited. PostWave does it the sanctioned way and treats
                your credentials like they matter — because they do.
              </p>
              <Link href="/security" className="mt-6 inline-block">
                <Button variant="secondary">
                  Read our security approach
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Reveal>

            <Reveal delay={80}>
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: KeyRound, t: "OAuth only", d: "We never see your password." },
                  { icon: Lock, t: "Encrypted tokens", d: "Access tokens encrypted at rest." },
                  { icon: Shield, t: "Policy-compliant", d: "Official API, no DOM hacks." },
                  { icon: Clock, t: "Disconnect anytime", d: "Revoke access in one click." },
                ].map((c) => (
                  <li
                    key={c.t}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <c.icon className="h-5 w-5 text-sky-400" />
                    <p className="mt-3 text-sm font-semibold text-white">{c.t}</p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">{c.d}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Loved by people who ship"
            title="The quiet relief of never missing a post"
            description="A glimpse of how founders and creators put PostWave to work."
          />
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.handle} delay={(i % 3) * 70}>
              <TweetCard {...t} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="scroll-mt-20 border-t border-zinc-800 bg-zinc-900/20 py-24">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal>
            <SectionHeading
              eyebrow="FAQ"
              title="Questions, answered straight"
            />
          </Reveal>
          <Reveal delay={80} className="mt-12">
            <Faq items={faqs} />
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-linear-to-br from-sky-500/10 via-zinc-950 to-zinc-950 p-10 text-center md:p-16">
            <div className="glow-orb absolute left-1/2 top-0 h-72 w-[600px] -translate-x-1/2" />
            <div className="relative">
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Set it tonight. Forget it tomorrow.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-zinc-400">
                Connect your X account, paste your posts, and let PostWave handle the
                clock. Start free — no card, 10 posts a month, cancel whenever.
              </p>
              <Link href="/signup" className="mt-8 inline-block">
                <Button size="lg" className="group">
                  Create your free account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
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
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}

function FeatureTile({
  icon: Icon,
  title,
  description,
  tall,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tall?: boolean;
}) {
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition-colors hover:border-zinc-700">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>
      {tall && (
        <div className="mt-6 flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 font-mono text-xs leading-relaxed text-zinc-500">
          <span className="text-emerald-400">2026-06-10 09:00</span> | Morning thread hook 🧵
          <br />
          <span className="text-emerald-400">2026-06-10 14:00</span> | Product update goes live
          <br />
          <span className="text-emerald-400">2026-06-10 18:30</span> | End-of-day recap
          <br />
          <span className="text-zinc-700"># no time → stays a draft</span>
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="bg-zinc-950 px-6 py-10 text-center">
      <p className="font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
        {value}
      </p>
      <p className="mx-auto mt-3 max-w-60 text-sm text-zinc-500">{label}</p>
    </div>
  );
}

function QueuePreview() {
  const rows = [
    { time: "Today · 09:00", text: "Morning thread hook 🧵", status: "published" },
    { time: "Today · 14:00", text: "Product update goes live", status: "published" },
    { time: "Today · 18:30", text: "End-of-day recap + CTA", status: "scheduled" },
    { time: "Tomorrow · 08:00", text: "Reply-bait question for the timeline", status: "scheduled" },
  ] as const;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50 lg:col-span-3">
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-2 font-mono text-xs text-zinc-500">postwave · your queue</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-400" />
          Worker live
        </span>
      </div>
      <ul className="divide-y divide-zinc-800/70">
        {rows.map((r) => (
          <li key={r.text} className="flex items-center gap-4 px-5 py-4">
            <span className="w-28 shrink-0 font-mono text-xs text-zinc-500">
              {r.time}
            </span>
            <span className="flex-1 truncate text-sm text-zinc-200">{r.text}</span>
            {r.status === "published" ? (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                <Check className="h-3 w-3" />
                Published
              </span>
            ) : (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-400">
                <Clock className="h-3 w-3" />
                Scheduled
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PastePreview() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50 lg:col-span-2">
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <ClipboardPaste className="h-3.5 w-3.5 text-sky-400" />
        <span className="font-mono text-xs text-zinc-500">bulk-paste.txt</span>
      </div>
      <pre className="flex-1 overflow-x-auto p-5 font-mono text-xs leading-relaxed text-zinc-300">
{`2026-06-10 09:00 | Morning thread hook 🧵
2026-06-10 14:00 | Product update live
2026-06-10 18:30 | End-of-day recap

# no time? stays a draft`}
      </pre>
      <div className="border-t border-zinc-800 bg-zinc-950/60 px-5 py-3 text-xs text-zinc-500">
        Paste → <span className="text-sky-400">Parse</span> →{" "}
        <span className="text-emerald-400">Queued ✓</span>
      </div>
    </div>
  );
}
