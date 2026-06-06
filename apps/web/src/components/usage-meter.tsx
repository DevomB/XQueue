"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type UsageData = {
  plan: string;
  usage: {
    postsUsed: number;
    postsLimit: number;
    linkPostsUsed: number;
    linkPostsLimit: number;
  };
};

export function UsageMeter() {
  const [data, setData] = useState<UsageData | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  const pct = Math.min(
    100,
    Math.round((data.usage.postsUsed / data.usage.postsLimit) * 100)
  );

  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{data.plan} plan</span>
        <span className="text-zinc-500">
          {data.usage.postsUsed} / {data.usage.postsLimit} posts
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-zinc-900 transition-all dark:bg-white"
          style={{ width: `${pct}%` }}
        />
      </div>
      {data.plan === "FREE" && pct > 70 && (
        <div className="mt-3">
          <Link href="/pricing">
            <Button size="sm" variant="secondary" className="w-full">
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      )}
      {data.usage.linkPostsLimit > 0 && (
        <p className="mt-2 text-xs text-zinc-500">
          Link posts: {data.usage.linkPostsUsed} / {data.usage.linkPostsLimit}
        </p>
      )}
    </div>
  );
}
