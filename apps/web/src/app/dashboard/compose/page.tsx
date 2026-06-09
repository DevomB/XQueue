"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ComposeForm } from "@/components/compose/compose-form";

type SettingsData = {
  timezone: string;
  xAccounts: { id: string; username: string }[];
};

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
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setSettings({
      timezone: data.timezone ?? "UTC",
      xAccounts: data.xAccounts ?? [],
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (!settings) {
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

      {createdId && (
        <div className="rounded-lg border border-emerald-800 bg-emerald-950/50 p-4 text-sm text-emerald-200">
          Post created.{" "}
          <Link
            href={`/dashboard/queue?highlight=${createdId}`}
            className="underline"
          >
            View in queue
          </Link>
        </div>
      )}

      <ComposeForm
        timezone={settings.timezone}
        username={settings.xAccounts[0]?.username}
        xAccounts={settings.xAccounts}
        onCreated={(id) => setCreatedId(id)}
      />
    </div>
  );
}
