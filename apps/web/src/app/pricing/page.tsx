import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { Faq, type FaqItem } from "@/components/marketing/faq";

const pricingFaqs: FaqItem[] = [
  {
    q: "Is there really a free plan?",
    a: "Yes — 10 scheduled text posts every month, forever, no credit card. It's enough to run a light posting cadence and see exactly how XQueue works before you ever pay.",
  },
  {
    q: "Why do link posts cost extra on Pro?",
    a: "X charges a premium through its API for posts containing URLs (~$0.20 each). We pass that cost through transparently rather than baking it into a higher base price for everyone. Your plan includes a monthly allotment of link posts.",
  },
  {
    q: "What counts as a post?",
    a: "Any single scheduled tweet that successfully publishes. Drafts you never schedule don't count, and a failed post that you retry only counts once it actually goes out.",
  },
  {
    q: "Can I cancel or downgrade anytime?",
    a: "Anytime, in one click from settings. You keep Pro features until the end of the period you've paid for, then roll back to Free automatically. No support ticket required.",
  },
  {
    q: "Do you offer refunds?",
    a: "Pro starts with a 7-day free trial so you can evaluate it risk-free. If something goes wrong after that, email us — we're a small team and we'll make it right.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0" />
        <div className="glow-orb absolute left-1/2 top-0 h-80 w-[700px] -translate-x-1/2" />
        <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-16">
          <Reveal>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-sky-400">
                Pricing
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                Simple, honest pricing
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-zinc-400">
                Start free and stay free as long as you like. Upgrade when you
                need images, links, and real volume.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80} className="mt-12">
            <PricingPlans />
          </Reveal>

          <Reveal delay={120}>
            <p className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-2 text-center text-sm text-zinc-500">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Text-only posts are effectively free via the X API and included in
              every plan. Link posts use X&apos;s ~$0.20/post pricing, passed
              through transparently.
            </p>
          </Reveal>
        </main>
      </section>

      <section className="border-t border-zinc-800 bg-zinc-900/20 py-24">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-sky-400">
                Pricing FAQ
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
                No surprises on your bill
              </h2>
            </div>
          </Reveal>
          <Reveal delay={80} className="mt-12">
            <Faq items={pricingFaqs} />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <div className="rounded-3xl border border-sky-500/20 bg-linear-to-br from-sky-500/10 to-transparent p-10 text-center md:p-14">
            <h2 className="text-3xl font-bold tracking-tight">
              Try it free tonight
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-zinc-400">
              Ten free posts a month, no card required. Decide if Pro is worth it
              after you&apos;ve watched it publish on its own.
            </p>
            <Link href="/signup" className="mt-8 inline-block">
              <Button size="lg" className="group">
                Start free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
