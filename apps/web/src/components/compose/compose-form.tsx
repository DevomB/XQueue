"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UrlWarning } from "@/components/url-warning";

type Props = {
  timezone: string;
  plan: string;
  onCreated: () => void;
};

export function ComposeForm({ timezone, plan, onCreated }: Props) {
  const [text, setText] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      return;
    }
    setMediaUrls((prev) => [...prev, data.url].slice(0, 4));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body: Record<string, unknown> = {
      text,
      timezone,
      mediaUrls,
    };

    if (scheduledAt) {
      body.scheduledAt = new Date(scheduledAt).toISOString();
      body.status = "SCHEDULED";
    } else {
      body.status = "DRAFT";
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create post");
      setLoading(false);
      return;
    }

    setText("");
    setScheduledAt("");
    setMediaUrls([]);
    onCreated();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Post text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={280}
          className="min-h-[120px] w-full rounded-lg border border-zinc-300 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          required
        />
        <p className="mt-1 text-xs text-zinc-500">{text.length}/280</p>
      </div>

      <UrlWarning text={text} />

      <div>
        <label className="mb-2 block text-sm font-medium">
          Schedule (optional)
        </label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <p className="mt-1 text-xs text-zinc-500">Timezone: {timezone}</p>
      </div>

      {plan === "PRO" && (
        <div>
          <label className="mb-2 block text-sm font-medium">
            Images (Pro, max 4)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={mediaUrls.length >= 4}
          />
          {mediaUrls.length > 0 && (
            <p className="mt-1 text-xs text-zinc-500">
              {mediaUrls.length} image(s) attached
            </p>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading || !text.trim()}>
        {loading ? "Saving..." : scheduledAt ? "Schedule post" : "Save draft"}
      </Button>
    </form>
  );
}
