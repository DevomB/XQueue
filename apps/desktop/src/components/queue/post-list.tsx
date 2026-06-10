import { useRef, useState } from "react";
import { ExternalLink, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UrlWarning } from "@/components/url-warning";
import { useToast } from "@/components/ui/toast";
import { ipc, ipcSafe, type PostItem } from "@/lib/ipc";

export type { PostItem };

type Props = {
  posts: PostItem[];
  onRefresh: () => void;
  filter?: string;
  highlightId?: string;
};

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PostList({ posts, onRefresh, filter, highlightId }: Props) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editSchedule, setEditSchedule] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    action: () => void;
  } | null>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  const filtered = filter ? posts.filter((p) => p.status === filter) : posts;

  if (highlightId && refs.current[highlightId]) {
    refs.current[highlightId]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function runAction(
    id: string,
    fn: () => Promise<unknown>
  ): Promise<boolean> {
    setLoadingId(id);
    setActionError(null);
    const result = await ipcSafe(fn);
    setLoadingId(null);
    if ("error" in result) {
      setActionError(result.error);
      toast(result.error, "error");
      return false;
    }
    toast("Done", "success");
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
    const body: {
      text: string;
      scheduledAt?: string;
      status?: "SCHEDULED";
    } = { text: editText };

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

    const ok = await runAction(id, () => ipc.updatePost(id, body));
    if (ok) setEditingId(null);
  }

  async function duplicatePost(post: PostItem) {
    const result = await ipcSafe(() =>
      ipc.createPost({
        text: post.text,
        mediaUrls: post.mediaUrls,
        status: "DRAFT",
      })
    );
    if ("error" in result) {
      toast(result.error, "error");
      return;
    }
    toast("Post duplicated as draft", "success");
    onRefresh();
  }

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No posts in this view yet.</p>
    );
  }

  return (
    <div className="space-y-3" aria-live="polite">
      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.title ?? ""}
        message={confirm?.message ?? ""}
        danger
        confirmLabel="Delete"
        onConfirm={() => {
          confirm?.action();
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />

      {actionError && (
        <p
          className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400"
          role="alert"
        >
          {actionError}
        </p>
      )}
      {filtered.map((post) => (
        <div
          key={post.id}
          ref={(el) => {
            refs.current[post.id] = el;
          }}
          className={`rounded-xl border p-4 ${
            highlightId === post.id
              ? "border-sky-500 bg-sky-950/20"
              : "border-zinc-200 dark:border-zinc-800"
          }`}
        >
          {editingId === post.id ? (
            <div className="space-y-3">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={280}
                className="min-h-[80px]"
              />
              <p className="text-xs text-zinc-500">{editText.length}/280</p>
              <UrlWarning text={editText} />
              <Input
                type="datetime-local"
                value={editSchedule}
                onChange={(e) => setEditSchedule(e.target.value)}
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
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    post.status === "QUEUED"
                      ? "bg-sky-900 text-sky-300"
                      : post.status === "FAILED"
                        ? "bg-red-900 text-red-300"
                        : "bg-zinc-100 dark:bg-zinc-800"
                  }`}
                >
                  {post.status === "QUEUED" ? "Publishing…" : post.status}
                </span>
              </div>

              {post.mediaUrls.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {post.mediaUrls.map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt=""
                      className="h-16 max-h-16 rounded-lg border border-zinc-700 object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                {post.scheduledAt && (
                  <span>{new Date(post.scheduledAt).toLocaleString()}</span>
                )}
                {post.mediaUrls.length > 0 && (
                  <span className="flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    {post.mediaUrls.length}
                  </span>
                )}
                {post.isLinkPost && (
                  <span className="text-amber-600">Contains URL</span>
                )}
              </div>

              {post.failureReason && (
                <p
                  className="mt-2 select-text rounded bg-red-950/50 p-2 text-sm text-red-400"
                  title={post.failureReason}
                >
                  {post.failureReason}
                </p>
              )}

              {post.status === "PUBLISHED" && post.xTweetId && (
                <a
                  href={`https://x.com/i/web/status/${post.xTweetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-sky-400 hover:underline"
                >
                  View on X <ExternalLink className="h-3 w-3" />
                </a>
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
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={loadingId === post.id}
                  onClick={() => duplicatePost(post)}
                >
                  Duplicate
                </Button>
                {post.status === "FAILED" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={loadingId === post.id}
                    onClick={() =>
                      runAction(post.id, () => ipc.retryPost(post.id))
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
                      runAction(post.id, () =>
                        ipc.updatePost(post.id, { status: "CANCELLED" })
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
                      setConfirm({
                        title: "Delete post",
                        message: "This cannot be undone.",
                        action: () => {
                          runAction(post.id, () => ipc.deletePost(post.id));
                        },
                      })
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
