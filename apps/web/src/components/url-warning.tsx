"use client";

import { isLinkPost, X_API_COSTS } from "@postwave/shared";

export function UrlWarning({ text }: { text: string }) {
  if (!text || !isLinkPost(text)) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      This post contains a URL. The X API charges more for link posts (~$
      {X_API_COSTS.linkPostUsd.toFixed(2)} vs ~$
      {X_API_COSTS.textPostUsd.toFixed(3)} for text-only). Costs are billed to
      your X Developer account.
    </div>
  );
}
