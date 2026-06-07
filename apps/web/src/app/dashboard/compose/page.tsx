"use client";

import { useCallback, useEffect, useState } from "react";
import { ComposeForm } from "@/components/compose/compose-form";

function ComposeSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-32 rounded bg-zinc-800" />
      <div className="h-32 rounded-xl bg-zinc-900" />
      <div className="h-10 w-40 rounded bg-zinc-800" />
    </div>
  );
}

export default function ComposePage() {
  const [timezone, setTimezone] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setTimezone(data.timezone ?? "UTC");
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (!timezone) {
    return (
      <div className="space-y-6">
        <ComposeSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compose</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Write a single post or save it as a draft.
        </p>
      </div>
      <ComposeForm timezone={timezone} onCreated={() => {}} />
    </div>
  );
}
