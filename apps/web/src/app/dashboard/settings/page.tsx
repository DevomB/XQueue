"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type XAccount = { id: string; username: string; connectedAt: string };

function SettingsContent() {
  const searchParams = useSearchParams();
  const [timezone, setTimezone] = useState("UTC");
  const [plan, setPlan] = useState("FREE");
  const [xAccounts, setXAccounts] = useState<XAccount[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setTimezone(data.timezone ?? "UTC");
    setPlan(data.plan ?? "FREE");
    setXAccounts(data.xAccounts ?? []);
  }, []);

  useEffect(() => {
    // Fetch settings on mount + surface OAuth/billing redirect banners. The
    // settings state updates happen after the await inside load().
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const xConnected = searchParams.get("x_connected");
    const xError = searchParams.get("x_error");
    const upgraded = searchParams.get("upgraded");
    if (xConnected) setMessage("X account connected successfully.");
    if (xError) setMessage(`X connection failed: ${xError}`);
    if (upgraded) setMessage("Welcome to Pro! Image posts are now unlocked.");
  }, [load, searchParams]);

  async function saveTimezone() {
    setLoading(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone }),
    });
    setLoading(false);
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

  async function upgrade() {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function manageBilling() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Manage your account, X connection, and billing.
        </p>
      </div>

      {message && (
        <p className="rounded-lg bg-zinc-100 p-3 text-sm dark:bg-zinc-900">
          {message}
        </p>
      )}

      <section className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="font-semibold">Timezone</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Used for bulk paste scheduling and display.
        </p>
        <div className="mt-4 flex gap-2">
          <input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="America/New_York"
          />
          <Button onClick={saveTimezone} disabled={loading} size="sm">
            Save
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="font-semibold">X account</h2>
        <p className="mt-1 text-sm text-zinc-500">
          PostWave will post on your behalf at scheduled times. You can disconnect
          anytime.
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

      <section className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="font-semibold">Billing</h2>
        <p className="mt-1 text-sm text-zinc-500">Current plan: {plan}</p>
        <div className="mt-4 flex gap-2">
          {plan === "FREE" ? (
            <Button onClick={upgrade}>Upgrade to Pro — $15/mo</Button>
          ) : (
            <Button variant="secondary" onClick={manageBilling}>
              Manage billing
            </Button>
          )}
        </div>
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

export default function SettingsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
      <SettingsContent />
    </Suspense>
  );
}
