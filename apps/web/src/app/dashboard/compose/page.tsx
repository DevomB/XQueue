"use client";

import { useCallback, useEffect, useState } from "react";
import { ComposeForm } from "@/components/compose/compose-form";

export default function ComposePage() {
  const [timezone, setTimezone] = useState("UTC");
  const [plan, setPlan] = useState("FREE");
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setTimezone(data.timezone ?? "UTC");
    setPlan(data.plan ?? "FREE");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compose</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Write a single post or save it as a draft.
        </p>
      </div>
      {message && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
          {message}
        </p>
      )}
      <ComposeForm
        timezone={timezone}
        plan={plan}
        onCreated={() => {
          setMessage("Post saved successfully.");
          setTimeout(() => setMessage(null), 3000);
        }}
      />
    </div>
  );
}
