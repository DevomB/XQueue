"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { BulkPasteForm } from "@/components/queue/bulk-paste-form";
import { PostList, type PostItem } from "@/components/queue/post-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type ViewMode = "list" | "calendar";

function QueueContent() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [timezone, setTimezone] = useState("UTC");
  const [filter, setFilter] = useState(searchParams.get("filter") ?? "");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("scheduled-asc");
  const [view, setView] = useState<ViewMode>("list");
  const [retryConfirm, setRetryConfirm] = useState<string | null>(null);
  const highlightId = searchParams.get("highlight") ?? undefined;

  const load = useCallback(async () => {
    const [postsRes, settingsRes] = await Promise.all([
      fetch("/api/posts"),
      fetch("/api/settings"),
    ]);
    const postsData = await postsRes.json();
    const settingsData = await settingsRes.json();
    setPosts(
      (postsData.posts ?? []).map((p: PostItem) => ({
        ...p,
        mediaUrls: p.mediaUrls ?? [],
        xTweetId: p.xTweetId ?? null,
        publishedAt: p.publishedAt ?? null,
      }))
    );
    setTimezone(settingsData.timezone ?? "UTC");
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    const retryId = searchParams.get("retry");
    if (retryId) setRetryConfirm(retryId);
  }, [searchParams]);

  const statuses = [
    "",
    "SCHEDULED",
    "QUEUED",
    "DRAFT",
    "PUBLISHED",
    "FAILED",
    "CANCELLED",
  ];

  const displayed = useMemo(() => {
    let list = filter ? posts.filter((p) => p.status === filter) : [...posts];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.text.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      if (sort === "scheduled-asc") {
        return (
          new Date(a.scheduledAt ?? 0).getTime() -
          new Date(b.scheduledAt ?? 0).getTime()
        );
      }
      if (sort === "scheduled-desc") {
        return (
          new Date(b.scheduledAt ?? 0).getTime() -
          new Date(a.scheduledAt ?? 0).getTime()
        );
      }
      return (
        new Date(b.scheduledAt ?? b.scheduledAt ?? 0).getTime() -
        new Date(a.scheduledAt ?? a.scheduledAt ?? 0).getTime()
      );
    });

    return list;
  }, [posts, filter, search, sort]);

  const calendarGroups = useMemo(() => {
    const groups: Record<string, PostItem[]> = {};
    for (const post of displayed) {
      if (!post.scheduledAt) continue;
      const key = format(new Date(post.scheduledAt), "yyyy-MM-dd");
      if (!groups[key]) groups[key] = [];
      groups[key].push(post);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [displayed]);

  function exportQueue() {
    const lines = posts
      .filter((p) => ["SCHEDULED", "DRAFT"].includes(p.status) && p.scheduledAt)
      .map((p) => {
        const d = new Date(p.scheduledAt!);
        const local = format(d, "yyyy-MM-dd HH:mm");
        return `${local} | ${p.text}`;
      });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "postwave-queue.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function confirmRetry() {
    if (!retryConfirm) return;
    await fetch(`/api/posts/${retryConfirm}/retry`, { method: "POST" });
    setRetryConfirm(null);
    load();
  }

  return (
    <div className="space-y-8">
      <ConfirmDialog
        open={retryConfirm !== null}
        title="Retry failed post"
        message="Schedule this post to publish in about 1 minute?"
        confirmLabel="Retry"
        onConfirm={confirmRetry}
        onCancel={() => setRetryConfirm(null)}
      />

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
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm"
          >
            {statuses.map((s) => (
              <option key={s || "all"} value={s}>
                {s || "All statuses"}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="scheduled-asc">Schedule ↑</option>
            <option value="scheduled-desc">Schedule ↓</option>
          </Select>
          <div className="flex gap-1 rounded-lg border border-zinc-700 p-0.5">
            <button
              type="button"
              className={`rounded px-2 py-1 text-xs ${view === "list" ? "bg-zinc-800" : ""}`}
              onClick={() => setView("list")}
            >
              List
            </button>
            <button
              type="button"
              className={`rounded px-2 py-1 text-xs ${view === "calendar" ? "bg-zinc-800" : ""}`}
              onClick={() => setView("calendar")}
            >
              Calendar
            </button>
          </div>
          <Button size="sm" variant="secondary" onClick={exportQueue}>
            Export
          </Button>
        </div>

        <Input
          placeholder="Search posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 max-w-sm"
        />

        {view === "list" ? (
          <PostList
            posts={displayed}
            onRefresh={load}
            highlightId={highlightId}
          />
        ) : (
          <div className="space-y-6">
            {calendarGroups.length === 0 ? (
              <p className="text-sm text-zinc-500">No scheduled posts to show.</p>
            ) : (
              calendarGroups.map(([date, dayPosts]) => (
                <div key={date}>
                  <h3 className="mb-2 font-mono text-sm text-zinc-400">{date}</h3>
                  <PostList posts={dayPosts} onRefresh={load} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function QueuePage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading queue…</p>}>
      <QueueContent />
    </Suspense>
  );
}
