"use client";

import { useCallback, useEffect, useState } from "react";
import { BulkPasteForm } from "@/components/queue/bulk-paste-form";
import { PostList, type PostItem } from "@/components/queue/post-list";

export default function QueuePage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [timezone, setTimezone] = useState("UTC");
  const [filter, setFilter] = useState<string>("");

  const load = useCallback(async () => {
    const [postsRes, settingsRes] = await Promise.all([
      fetch("/api/posts"),
      fetch("/api/settings"),
    ]);
    const postsData = await postsRes.json();
    const settingsData = await settingsRes.json();
    setPosts(postsData.posts ?? []);
    setTimezone(settingsData.timezone ?? "UTC");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const statuses = ["", "SCHEDULED", "DRAFT", "PUBLISHED", "FAILED", "CANCELLED"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Queue</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Paste a batch of posts or manage your scheduled queue.
        </p>
      </div>

      <BulkPasteForm timezone={timezone} onImported={load} />

      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">All posts</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {statuses.map((s) => (
              <option key={s || "all"} value={s}>
                {s || "All statuses"}
              </option>
            ))}
          </select>
        </div>
        <PostList
          posts={posts}
          onRefresh={load}
          filter={filter || undefined}
        />
      </div>
    </div>
  );
}
