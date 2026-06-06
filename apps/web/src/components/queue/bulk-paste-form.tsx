"use client";

import { useState } from "react";
import { isLinkPost, parseBulkPaste } from "@postwave/shared";
import { Button } from "@/components/ui/button";
import { UrlWarning } from "@/components/url-warning";

type Props = {
  timezone: string;
  onImported: () => void;
};

export function BulkPasteForm({ timezone, onImported }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = input.trim() ? parseBulkPaste(input, timezone) : [];

  async function handleImport() {
    setLoading(true);
    setError(null);

    const posts = preview
      .filter((line) => !line.error)
      .map((line) => ({
        text: line.text,
        scheduledAt: line.scheduledAt?.toISOString(),
        isDraft: line.isDraft,
      }));

    if (posts.length === 0) {
      setError("No valid posts to import");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posts, timezone }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Import failed");
      setLoading(false);
      return;
    }

    setInput("");
    onImported();
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Bulk paste</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`2026-06-05 14:00 | Your first post\n2026-06-05 18:30 | Another post\nJust a draft with no time`}
          className="min-h-[160px] w-full rounded-lg border border-zinc-300 bg-white p-3 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Format: YYYY-MM-DD HH:mm | post text. Lines without a datetime save as
          drafts. Times use your timezone ({timezone}).
        </p>
      </div>

      {preview.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Text</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((line) => (
                <tr key={line.lineNumber} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-3 py-2 text-zinc-500">{line.lineNumber}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {line.scheduledAt
                      ? line.scheduledAt.toLocaleString()
                      : "Draft"}
                  </td>
                  <td className="max-w-xs truncate px-3 py-2">{line.text}</td>
                  <td className="px-3 py-2">
                    {line.error ? (
                      <span className="text-red-600">{line.error}</span>
                    ) : line.isDraft ? (
                      <span className="text-zinc-500">Draft</span>
                    ) : (
                      <span className="text-green-600">Ready</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {preview.some((l) => isLinkPost(l.text)) && (
        <UrlWarning text={preview.map((l) => l.text).join("\n")} />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        onClick={handleImport}
        disabled={loading || preview.filter((l) => !l.error).length === 0}
      >
        {loading ? "Importing..." : "Import to queue"}
      </Button>
    </div>
  );
}
