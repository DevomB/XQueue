import { QUEUED_STALE_THRESHOLD_MS } from "@postwave/shared";
import type { PostRepository } from "../ports.js";
import { logError, logInfo, logWarn } from "../logger.js";

export type RecoveryDeps = {
  postRepository: PostRepository;
  onRecovered: (postId: string, scheduledAt: Date | null) => void | Promise<void>;
};

export function createRecovery(deps: RecoveryDeps) {
  return {
    async recoverStaleQueued(): Promise<number> {
      const threshold = new Date(Date.now() - QUEUED_STALE_THRESHOLD_MS);
      const stale = await deps.postRepository.findStaleQueued(threshold);

      if (stale.length === 0) {
        return 0;
      }

      for (const post of stale) {
        logWarn("Recovering stale QUEUED post", {
          scheduledPostId: post.id,
          updatedAt: post.updatedAt.toISOString(),
        });

        await deps.postRepository.recoverToScheduled(post.id);
        await deps.onRecovered(post.id, post.scheduledAt);
      }

      logInfo("Stale QUEUED recovery complete", { count: stale.length });
      return stale.length;
    },
  };
}

export function startRecoveryInterval(
  recover: () => Promise<number>,
  intervalMs: number
): ReturnType<typeof setInterval> {
  return setInterval(() => {
    recover().catch((err) => {
      logError("QUEUED recovery cron failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }, intervalMs);
}
