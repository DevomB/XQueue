"use client";

import { isLinkPost, X_API_COSTS } from "@postwave/shared";

export function UrlWarning({ text }: { text: string }) {
  if (!text || !isLinkPost(text)) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      This post contains a URL. X API charges ~$
      {X_API_COSTS.linkPostUsd.toFixed(2)} per link post (vs ~$
      {X_API_COSTS.textPostUsd.toFixed(3)} for text-only). Link posts count
      toward your monthly link post quota on Pro.
    </div>
  );
}
