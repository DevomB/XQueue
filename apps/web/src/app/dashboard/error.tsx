"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
      <h2 className="font-semibold text-red-800 dark:text-red-200">
        Dashboard error
      </h2>
      <p className="mt-2 text-sm text-red-700 dark:text-red-300">
        Could not load this page. Your scheduled posts are unaffected.
      </p>
      <Button className="mt-4" size="sm" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
