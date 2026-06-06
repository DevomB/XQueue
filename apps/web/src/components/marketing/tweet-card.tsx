import { BadgeCheck } from "lucide-react";

export type Testimonial = {
  name: string;
  handle: string;
  /** Tailwind gradient classes for the avatar, e.g. "from-sky-500 to-cyan-400". */
  avatar: string;
  body: string;
  verified?: boolean;
};

/**
 * Illustrative testimonial rendered as an X-style post. See docs/THEME.md
 * (Social proof policy) — personas are representative, not real individuals.
 */
export function TweetCard({ name, handle, avatar, body, verified }: Testimonial) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <figure className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br ${avatar} text-sm font-semibold text-zinc-950`}
        >
          {initials}
        </span>
        <div className="min-w-0">
          <figcaption className="flex items-center gap-1 text-sm font-semibold text-white">
            <span className="truncate">{name}</span>
            {verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-sky-400" aria-label="Verified" />
            )}
          </figcaption>
          <p className="truncate text-sm text-zinc-500">{handle}</p>
        </div>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="ml-auto h-4 w-4 shrink-0 fill-zinc-600"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
      <blockquote className="mt-4 text-sm leading-relaxed text-zinc-300">
        {body}
      </blockquote>
    </figure>
  );
}
