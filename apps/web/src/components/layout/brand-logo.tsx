import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  /** Render just the mark, or the mark plus the "PostWave" wordmark. */
  variant?: "full" | "mark";
  /** Wrap in a link to home. Defaults to true. */
  href?: string | null;
  className?: string;
};

/**
 * The PostWave brand lockup. One source of truth for the mark + wordmark so the
 * logo stays identical in the header, footer, and anywhere else it appears.
 *
 * The mark reads as a queue (stacked rows) with one "beam" line going out —
 * the signal-blue post leaving the stack on schedule.
 */
export function BrandLogo({
  variant = "full",
  href = "/",
  className,
}: BrandLogoProps) {
  const lockup = (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {variant === "full" && (
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          PostWave
        </span>
      )}
    </span>
  );

  if (href === null) return lockup;

  return (
    <Link href={href} aria-label="PostWave home" className="inline-flex">
      {lockup}
    </Link>
  );
}

function LogoMark() {
  return (
    <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-sky-400 to-sky-600 shadow-lg shadow-sky-500/25">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-5 w-5"
      >
        {/* Queued rows */}
        <rect x="5" y="6.5" width="9" height="2" rx="1" className="fill-zinc-950/80" />
        <rect x="5" y="11" width="11" height="2" rx="1" className="fill-zinc-950/55" />
        <rect x="5" y="15.5" width="7" height="2" rx="1" className="fill-zinc-950/40" />
        {/* The post leaving the queue — the "beam" going out */}
        <path
          d="M15.5 12h4m0 0-1.8-1.8M19.5 12l-1.8 1.8"
          stroke="currentColor"
          className="text-zinc-950"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
