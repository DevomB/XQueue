import { cn } from "@/lib/utils";

type MarqueeProps = {
  items: string[];
  className?: string;
};

/**
 * Quiet, infinite social-proof strip. Items render twice so the CSS marquee
 * loops seamlessly (translateX -50%). Pauses on hover.
 */
export function Marquee({ items, className }: MarqueeProps) {
  const row = (ariaHidden: boolean) => (
    <div className="marquee-track" aria-hidden={ariaHidden}>
      {items.map((item, i) => (
        <span
          key={`${ariaHidden ? "b" : "a"}-${i}`}
          className="mx-6 flex items-center gap-2 whitespace-nowrap text-sm font-medium text-zinc-500"
        >
          <span className="h-1 w-1 rounded-full bg-sky-500/60" />
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn("marquee-mask marquee-pause overflow-hidden", className)}>
      <div className="flex">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
