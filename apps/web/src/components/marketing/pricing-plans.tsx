"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  tagline: string;
  monthly: number;
  /** Effective per-month price when billed annually. */
  annual: number;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    tagline: "For trying it on your own feed.",
    monthly: 0,
    annual: 0,
    features: [
      "10 scheduled text posts / month",
      "Bulk paste import",
      "1 connected X account",
      "Email alerts on failures",
      "Timezone-aware scheduling",
    ],
    cta: "Start free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    tagline: "For people who post seriously.",
    monthly: 15,
    annual: 12,
    features: [
      "150 scheduled posts / month",
      "Image posts (up to 4 per post)",
      "30 link posts / month",
      "Drafts, edits & one-click retry",
      "7-day free trial",
      "Priority email support",
    ],
    cta: "Start Pro trial",
    href: "/signup",
    highlighted: true,
  },
];

export function PricingPlans() {
  const [annual, setAnnual] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-center gap-3">
        <span
          className={cn(
            "text-sm transition-colors",
            !annual ? "text-white" : "text-zinc-500"
          )}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          aria-label="Toggle annual billing"
          onClick={() => setAnnual((v) => !v)}
          className={cn(
            "relative h-7 w-12 rounded-full border transition-colors",
            annual
              ? "border-sky-500/50 bg-sky-500/30"
              : "border-zinc-700 bg-zinc-800"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
              annual ? "translate-x-6" : "translate-x-0.5"
            )}
          />
        </button>
        <span
          className={cn(
            "flex items-center gap-2 text-sm transition-colors",
            annual ? "text-white" : "text-zinc-500"
          )}
        >
          Annual
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
            Save 20%
          </span>
        </span>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl items-start gap-8 md:grid-cols-2">
        {plans.map((plan) => {
          const price = annual ? plan.annual : plan.monthly;
          return (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-8",
                plan.highlighted
                  ? "beam-border border-transparent bg-linear-to-b from-sky-500/10 to-zinc-950 shadow-lg shadow-sky-500/10"
                  : "border-zinc-800 bg-zinc-900/50"
              )}
            >
              {plan.highlighted && (
                <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-medium text-sky-400">
                  Most popular
                </span>
              )}
              <h2
                className={cn(
                  "text-lg font-semibold text-white",
                  plan.highlighted && "mt-4"
                )}
              >
                {plan.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{plan.tagline}</p>
              <p className="mt-6 flex items-end gap-1">
                <span className="text-5xl font-bold tracking-tight text-white">
                  ${price}
                </span>
                <span className="mb-1 text-zinc-500">/mo</span>
              </p>
              <p className="mt-1 h-4 text-xs text-emerald-400">
                {annual && plan.monthly > 0
                  ? `Billed $${plan.annual * 12}/yr — save $${
                      (plan.monthly - plan.annual) * 12
                    }`
                  : ""}
              </p>
              <ul className="mt-8 space-y-3 text-sm text-zinc-300">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className="mt-8 block">
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "primary" : "secondary"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
