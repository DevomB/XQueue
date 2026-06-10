import { MAX_TWEET_LENGTH } from "@postwave/shared";

type Props = {
  text: string;
  username?: string;
  mediaUrls?: string[];
};

export function PostPreview({ text, username, mediaUrls = [] }: Props) {
  const handle = username ? `@${username}` : "@youraccount";
  const remaining = MAX_TWEET_LENGTH - text.length;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Preview
      </p>
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-cyan-400 text-sm font-semibold text-zinc-950">
          {(username ?? "Y")[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{handle}</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">
            {text || "Your post will appear here…"}
          </p>
          {mediaUrls.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-1">
              {mediaUrls.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt=""
                  className="max-h-32 rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <p
        className={`mt-3 text-right text-xs ${remaining < 0 ? "text-red-400" : "text-zinc-500"}`}
      >
        {remaining} characters remaining
      </p>
    </div>
  );
}
