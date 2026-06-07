"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { COMMON_TIMEZONES } from "@/lib/timezones";

type XAccount = { id: string; username: string; connectedAt: string };

function SettingsContent() {
  const searchParams = useSearchParams();
  const [timezone, setTimezone] = useState("UTC");
  const [customTimezone, setCustomTimezone] = useState("");
  const [xAccounts, setXAccounts] = useState<XAccount[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    const tz = data.timezone ?? "UTC";
    setTimezone(COMMON_TIMEZONES.includes(tz) ? tz : "custom");
    setCustomTimezone(COMMON_TIMEZONES.includes(tz) ? "" : tz);
    setXAccounts(data.xAccounts ?? []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const xConnected = searchParams.get("x_connected");
    const xError = searchParams.get("x_error");
    if (xConnected) setMessage("X account connected successfully.");
    if (xError) setError(`X connection failed: ${xError}`);
  }, [load, searchParams]);

  async function saveTimezone() {
    setLoading(true);
    setError(null);
    const value = timezone === "custom" ? customTimezone : timezone;
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone: value }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to save timezone");
      return;
    }
    setMessage("Timezone saved.");
  }

  async function disconnect(xAccountId: string) {
    setLoading(true);
    await fetch("/api/x/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xAccountId }),
    });
    await load();
    setLoading(false);
  }

  async function deleteAccount() {
    if (
      !confirm(
        "Delete your account and all scheduled posts? This cannot be undone."
      )
    ) {
      return;
    }
    await fetch("/api/account/delete", { method: "DELETE" });
    window.location.href = "/";
  }

  return (
    <div className="space-y-8" aria-live="polite">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Manage your account and X connection.
        </p>
      </div>

      {message && (
        <p className="rounded-lg bg-zinc-100 p-3 text-sm dark:bg-zinc-900">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950" role="alert">
          {error}
        </p>
      )}

      <section className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="font-semibold">Timezone</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Used for bulk paste scheduling and display.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <select
            id="settings-timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
            <option value="custom">Custom IANA timezone...</option>
          </select>
          {timezone === "custom" && (
            <input
              value={customTimezone}
              onChange={(e) => setCustomTimezone(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="America/New_York"
            />
          )}
          <Button onClick={saveTimezone} disabled={loading} size="sm">
            Save
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="font-semibold">X account</h2>
        <p className="mt-1 text-sm text-zinc-500">
          PostWave posts on your behalf at scheduled times. Disconnect anytime.
        </p>
        {xAccounts.length === 0 ? (
          <a href="/api/x/authorize" className="mt-4 inline-block">
            <Button>Connect X account</Button>
          </a>
        ) : (
          <div className="mt-4 space-y-2">
            {xAccounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900"
              >
                <span>@{acc.username}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={loading}
                  onClick={() => disconnect(acc.id)}
                >
                  Disconnect
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-red-200 p-6 dark:border-red-900">
        <h2 className="font-semibold text-red-600">Danger zone</h2>
        <Button
          variant="danger"
          size="sm"
          className="mt-4"
          onClick={deleteAccount}
        >
          Delete account
        </Button>
      </section>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 w-48 rounded bg-zinc-800" />
      <div className="h-32 rounded-xl bg-zinc-900" />
      <div className="h-32 rounded-xl bg-zinc-900" />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}
