"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

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

export function PostList({ posts, onRefresh, filter }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = filter
    ? posts.filter((p) => p.status === filter)
    : posts;

  async function cancelPost(id: string) {
    setLoadingId(id);
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    onRefresh();
    setLoadingId(null);
  }

  async function retryPost(id: string) {
    setLoadingId(id);
    await fetch(`/api/posts/${id}/retry`, { method: "POST" });
    onRefresh();
    setLoadingId(null);
  }

  async function deletePost(id: string) {
    setLoadingId(id);
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    onRefresh();
    setLoadingId(null);
  }

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No posts in this view yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((post) => (
        <div
          key={post.id}
          className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
        >
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
            {post.isLinkPost && <span className="text-amber-600">Contains URL</span>}
          </div>
          {post.failureReason && (
            <p className="mt-2 text-sm text-red-600">{post.failureReason}</p>
          )}
          <div className="mt-3 flex gap-2">
            {post.status === "FAILED" && (
              <Button
                size="sm"
                variant="secondary"
                disabled={loadingId === post.id}
                onClick={() => retryPost(post.id)}
              >
                Retry
              </Button>
            )}
            {["SCHEDULED", "DRAFT", "FAILED"].includes(post.status) && (
              <>
                {post.status === "SCHEDULED" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={loadingId === post.id}
                    onClick={() => cancelPost(post.id)}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  disabled={loadingId === post.id}
                  onClick={() => deletePost(post.id)}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
