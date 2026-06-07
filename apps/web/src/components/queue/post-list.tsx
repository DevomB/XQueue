"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UrlWarning } from "@/components/url-warning";

export type PostItem = {
  id: string;
  text: string;
  scheduledAt: string | null;
  status: string;
  failureReason: string | null;
  isLinkPost: boolean;
};

type Props = {
  posts: PostItem[];
  onRefresh: () => void;
  filter?: string;
};

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PostList({ posts, onRefresh, filter }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editSchedule, setEditSchedule] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = filter
    ? posts.filter((p) => p.status === filter)
    : posts;

  async function apiAction(
    id: string,
    fn: () => Promise<Response>
  ): Promise<boolean> {
    setLoadingId(id);
    setActionError(null);
    const res = await fn();
    const data = await res.json().catch(() => ({}));
    setLoadingId(null);
    if (!res.ok) {
      setActionError(data.error ?? "Action failed");
      return false;
    }
    onRefresh();
    return true;
  }

  function startEdit(post: PostItem) {
    setEditingId(post.id);
    setEditText(post.text);
    setEditSchedule(toDatetimeLocalValue(post.scheduledAt));
    setActionError(null);
  }

  function startSchedule(post: PostItem) {
    setEditingId(post.id);
    setEditText(post.text);
    setEditSchedule("");
    setActionError(null);
  }

  async function saveEdit(id: string, schedule: boolean) {
    const body: Record<string, unknown> = { text: editText };
    if (schedule) {
      if (!editSchedule) {
        setActionError("Pick a schedule time");
        return;
      }
      body.scheduledAt = new Date(editSchedule).toISOString();
      body.status = "SCHEDULED";
    } else if (editSchedule) {
      body.scheduledAt = new Date(editSchedule).toISOString();
      body.status = "SCHEDULED";
    }

    const ok = await apiAction(id, () =>
      fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    );
    if (ok) setEditingId(null);
  }

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No posts in this view yet.</p>
    );
  }

  return (
    <div className="space-y-3" aria-live="polite">
      {actionError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400" role="alert">
          {actionError}
        </p>
      )}
      {filtered.map((post) => (
        <div
          key={post.id}
          className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
        >
          {editingId === post.id ? (
            <div className="space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={280}
                className="min-h-[80px] w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <UrlWarning text={editText} />
              <input
                type="datetime-local"
                value={editSchedule}
                onChange={(e) => setEditSchedule(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={loadingId === post.id}
                  onClick={() => saveEdit(post.id, false)}
                >
                  Save
                </Button>
                {post.status === "DRAFT" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={loadingId === post.id}
                    onClick={() => saveEdit(post.id, true)}
                  >
                    Schedule
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-2 flex items-start justify-between gap-4">
                <p className="text-sm whitespace-pre-wrap">{post.text}</p>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">
                  {post.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                {post.scheduledAt && (
                  <span>{new Date(post.scheduledAt).toLocaleString()}</span>
                )}
                {post.isLinkPost && (
                  <span className="text-amber-600">Contains URL</span>
                )}
              </div>
              {post.failureReason && (
                <p className="mt-2 text-sm text-red-600">{post.failureReason}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {["DRAFT", "SCHEDULED", "FAILED"].includes(post.status) && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={loadingId === post.id}
                    onClick={() => startEdit(post)}
                  >
                    Edit
                  </Button>
                )}
                {post.status === "DRAFT" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={loadingId === post.id}
                    onClick={() => startSchedule(post)}
                  >
                    Schedule
                  </Button>
                )}
                {post.status === "FAILED" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={loadingId === post.id}
                    onClick={() =>
                      apiAction(post.id, () =>
                        fetch(`/api/posts/${post.id}/retry`, { method: "POST" })
                      )
                    }
                  >
                    Retry
                  </Button>
                )}
                {post.status === "SCHEDULED" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={loadingId === post.id}
                    onClick={() =>
                      apiAction(post.id, () =>
                        fetch(`/api/posts/${post.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "CANCELLED" }),
                        })
                      )
                    }
                  >
                    Cancel
                  </Button>
                )}
                {["SCHEDULED", "DRAFT", "FAILED"].includes(post.status) && (
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={loadingId === post.id}
                    onClick={() =>
                      apiAction(post.id, () =>
                        fetch(`/api/posts/${post.id}`, { method: "DELETE" })
                      )
                    }
                  >
                    Delete
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
