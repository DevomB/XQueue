"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UrlWarning } from "@/components/url-warning";
import { MAX_IMAGES_PER_POST } from "@postwave/shared";

type Props = {
  timezone: string;
  onCreated: () => void;
};

export function ComposeForm({ timezone, onCreated }: Props) {
  const [text, setText] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      return;
    }
    setMediaUrls((prev) => [...prev, data.url].slice(0, MAX_IMAGES_PER_POST));
  }

  function removeImage(url: string) {
    setMediaUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

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
    setSuccess(scheduledAt ? "Post scheduled." : "Draft saved.");
    onCreated();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-live="polite">
      <div>
        <label htmlFor="compose-text" className="mb-2 block text-sm font-medium">
          Post text
        </label>
        <textarea
          id="compose-text"
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
        <label htmlFor="compose-schedule" className="mb-2 block text-sm font-medium">
          Schedule (optional)
        </label>
        <input
          id="compose-schedule"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <p className="mt-1 text-xs text-zinc-500">Timezone: {timezone}</p>
      </div>

      <div>
        <label htmlFor="compose-images" className="mb-2 block text-sm font-medium">
          Images (max {MAX_IMAGES_PER_POST})
        </label>
        <input
          id="compose-images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          disabled={uploading || mediaUrls.length >= MAX_IMAGES_PER_POST}
        />
        {uploading && (
          <p className="mt-1 text-xs text-zinc-500">Uploading...</p>
        )}
        {mediaUrls.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {mediaUrls.map((url) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Upload preview"
                  className="h-20 w-20 rounded-lg border border-zinc-700 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute -right-2 -top-2 rounded-full bg-zinc-800 p-1 text-zinc-300 hover:bg-red-600 hover:text-white"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}

      <Button type="submit" disabled={loading || uploading || !text.trim()}>
        {loading ? "Saving..." : scheduledAt ? "Schedule post" : "Save draft"}
      </Button>
    </form>
  );
}
