import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { COMMON_TIMEZONES } from "@/lib/timezones";
import { ipc, ipcSafe } from "@/lib/ipc";

type XAccount = { id: string; username: string; connectedAt?: string };

export function SettingsPage() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [timezone, setTimezone] = useState("UTC");
  const [customTimezone, setCustomTimezone] = useState("");
  const [xAccounts, setXAccounts] = useState<XAccount[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const data = await ipc.getSettings();
    const tz = data.timezone ?? "UTC";
    setTimezone(COMMON_TIMEZONES.includes(tz) ? tz : "custom");
    setCustomTimezone(COMMON_TIMEZONES.includes(tz) ? "" : tz);
    setXAccounts(data.xAccounts ?? []);
  }, []);

  useEffect(() => {
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
    const result = await ipcSafe(() => ipc.updateSettings({ timezone: value }));
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setMessage("Timezone saved.");
    toast("Timezone saved", "success");
  }

  async function disconnect(xAccountId: string) {
    setLoading(true);
    await ipc.disconnectXAccount(xAccountId);
    await load();
    setLoading(false);
  }

  async function connectX() {
    const url = await ipc.getXAuthorizeUrl();
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-8" aria-live="polite">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Manage your timezone and X connection.
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
          <Select
            id="settings-timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="flex-1"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
            <option value="custom">Custom IANA timezone...</option>
          </Select>
          {timezone === "custom" && (
            <Input
              value={customTimezone}
              onChange={(e) => setCustomTimezone(e.target.value)}
              className="flex-1"
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
          <Button className="mt-4" onClick={connectX}>
            Connect X account
          </Button>
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
    </div>
  );
}
