import { Plus } from "lucide-react";

export type FaqItem = {
  q: string;
  a: string;
};

/**
 * Accessible accordion built on native <details>/<summary> — no JS required,
 * which keeps it robust and SSR-friendly.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
      {items.map((item) => (
        <details key={item.q} className="group px-5 py-1 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-medium text-white marker:hidden [&::-webkit-details-marker]:hidden">
            {item.q}
            <Plus className="h-5 w-5 shrink-0 text-sky-400 transition-transform duration-200 group-open:rotate-45" />
          </summary>
          <p className="pb-5 pr-8 text-sm leading-relaxed text-zinc-400">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
