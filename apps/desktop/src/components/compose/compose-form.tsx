import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { UrlWarning } from "@/components/url-warning";
import { useToast } from "@/components/ui/toast";
import { PostPreview } from "@/components/compose/post-preview";
import { ipc, ipcSafe } from "@/lib/ipc";
import { MAX_IMAGES_PER_POST } from "@postwave/shared";

const DRAFT_KEY = "postwave-compose-draft";

type XAccount = { id: string; username: string };

type Props = {
  timezone: string;
  username?: string;
  xAccounts?: XAccount[];
  onCreated: (postId: string) => void;
};

export function ComposeForm({
  timezone,
  username,
  xAccounts = [],
  onCreated,
}: Props) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [xAccountId, setXAccountId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restorePrompt, setRestorePrompt] = useState(false);

  const xConnected = xAccounts.length > 0;

  useEffect(() => {
    if (xAccounts.length > 0 && !xAccountId) {
      setXAccountId(xAccounts[0].id);
    }
  }, [xAccounts, xAccountId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as {
          text?: string;
          mediaUrls?: string[];
        };
        if (draft.text || draft.mediaUrls?.length) {
          setRestorePrompt(true);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text || mediaUrls.length > 0) {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ text, mediaUrls })
        );
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [text, mediaUrls]);

  function restoreDraft() {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as {
          text?: string;
          mediaUrls?: string[];
        };
        if (draft.text) setText(draft.text);
        if (draft.mediaUrls) setMediaUrls(draft.mediaUrls);
      }
    } catch {
      /* ignore */
    }
    setRestorePrompt(false);
  }

  function discardDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setRestorePrompt(false);
  }

  function scheduleInFiveMinutes() {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    setScheduledAt(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setUploading(true);
    setError(null);

    const result = await ipcSafe(() => ipc.uploadImage(file));
    setUploading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    setMediaUrls((prev) => [...prev, result.data].slice(0, MAX_IMAGES_PER_POST));
  }

  function removeImage(url: string) {
    setMediaUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (scheduledAt && !xConnected) {
      setError("Connect an X account in Settings before scheduling.");
      return;
    }

    setLoading(true);
    setError(null);

    const input = {
      text,
      timezone,
      mediaUrls,
      ...(xAccountId ? { xAccountId } : {}),
      ...(scheduledAt
        ? {
            scheduledAt: new Date(scheduledAt).toISOString(),
            status: "SCHEDULED" as const,
          }
        : { status: "DRAFT" as const }),
    };

    const result = await ipcSafe(() => ipc.createPost(input));

    if ("error" in result) {
      setError(result.error);
      toast(result.error, "error");
      setLoading(false);
      return;
    }

    setText("");
    setScheduledAt("");
    setMediaUrls([]);
    localStorage.removeItem(DRAFT_KEY);
    const msg = scheduledAt ? "Post scheduled." : "Draft saved.";
    toast(msg, "success");
    onCreated(result.data.id);
    setLoading(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-4" aria-live="polite">
        {restorePrompt && (
          <div className="rounded-lg border border-sky-800 bg-sky-950/50 p-3 text-sm">
            <p className="text-sky-200">Restore unsaved draft?</p>
            <div className="mt-2 flex gap-2">
              <Button type="button" size="sm" onClick={restoreDraft}>
                Restore
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={discardDraft}>
                Discard
              </Button>
            </div>
          </div>
        )}

        {xAccounts.length > 1 && (
          <div>
            <label htmlFor="compose-account" className="mb-2 block text-sm font-medium">
              Post as
            </label>
            <Select
              id="compose-account"
              value={xAccountId}
              onChange={(e) => setXAccountId(e.target.value)}
            >
              {xAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  @{a.username}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <label htmlFor="compose-text" className="mb-2 block text-sm font-medium">
            Post text
          </label>
          <Textarea
            id="compose-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={280}
            className="min-h-[120px]"
            required
          />
          <p className="mt-1 text-xs text-zinc-500">{text.length}/280</p>
        </div>

        <UrlWarning text={text} />

        <div>
          <label htmlFor="compose-schedule" className="mb-2 block text-sm font-medium">
            Schedule (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            <Input
              id="compose-schedule"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="secondary" size="sm" onClick={scheduleInFiveMinutes}>
              +5 min
            </Button>
          </div>
          <p className="mt-1 text-xs text-zinc-500">Timezone: {timezone}</p>
          {scheduledAt && !xConnected && (
            <p className="mt-2 text-sm text-amber-500">
              <Link to="/settings" className="underline">
                Connect X
              </Link>{" "}
              to schedule posts.
            </p>
          )}
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
            className="text-sm text-zinc-400"
          />
          {uploading && (
            <p className="mt-1 text-xs text-zinc-500">Uploading...</p>
          )}
          {mediaUrls.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {mediaUrls.map((url) => (
                <div key={url} className="relative">
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

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={
            loading ||
            uploading ||
            !text.trim() ||
            (Boolean(scheduledAt) && !xConnected)
          }
        >
          {loading ? "Saving..." : scheduledAt ? "Schedule post" : "Save draft"}
        </Button>
      </form>
      <PostPreview
        text={text}
        username={xAccounts.find((a) => a.id === xAccountId)?.username ?? username}
        mediaUrls={mediaUrls}
      />
    </div>
  );
}
