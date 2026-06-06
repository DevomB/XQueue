import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Simple pricing</h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Start free. Upgrade when you need images and higher volume.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
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
          ? "border-zinc-900 shadow-lg dark:border-white"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <h2 className="text-xl font-semibold">{name}</h2>
      <p className="mt-4">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-zinc-500">{period}</span>
      </p>
      <ul className="mt-6 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
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
