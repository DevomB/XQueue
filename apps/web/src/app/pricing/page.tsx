import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-sky-400">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Simple, honest pricing
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-zinc-400">
            Start free. Upgrade when you need images and higher volume.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-2">
          <PlanCard
            name="Free"
            price="$0"
            period="/month"
            features={[
              "10 scheduled text posts/month",
              "Bulk paste import",
              "1 connected X account",
              "Email alerts on failures",
              "No image posts",
            ]}
            cta="Start free"
            href="/signup"
            highlighted={false}
          />
          <PlanCard
            name="Pro"
            price="$15"
            period="/month"
            features={[
              "150 scheduled posts/month",
              "Image posts (up to 4 per post)",
              "30 link posts/month",
              "7-day free trial",
              "Priority email support",
            ]}
            cta="Start Pro trial"
            href="/signup"
            highlighted
          />
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-zinc-500">
          Posts containing URLs use X API link pricing (~$0.20/post). Text-only
          posts cost ~$0.015 via X API — included in your subscription.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function PlanCard({
  name,
  price,
  period,
  features,
  cta,
  href,
  highlighted,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-8 ${
        highlighted
          ? "border-sky-500/50 bg-gradient-to-b from-sky-500/10 to-zinc-950 shadow-lg shadow-sky-500/10"
          : "border-zinc-800 bg-zinc-900/50"
      }`}
    >
      {highlighted && (
        <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-medium text-sky-400">
          Most popular
        </span>
      )}
      <h2 className={`font-semibold text-white ${highlighted ? "mt-4" : ""}`}>
        {name}
      </h2>
      <p className="mt-4">
        <span className="text-5xl font-bold">{price}</span>
        <span className="text-zinc-500">{period}</span>
      </p>
      <ul className="mt-8 space-y-3 text-sm text-zinc-400">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="text-sky-400">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Link href={href} className="mt-8 block">
        <Button className="w-full" variant={highlighted ? "primary" : "secondary"}>
          {cta}
        </Button>
      </Link>
    </div>
  );
}
