import {
  QUEUED_STALE_THRESHOLD_MS,
  type PublishPostJobData,
} from "@postwave/shared";
import { Queue } from "bullmq";
import { prisma } from "./lib/db.js";
import { logError, logInfo, logWarn } from "./lib/logger.js";

export async function recoverStaleQueuedPosts(
  publishQueue: Queue<PublishPostJobData>
): Promise<number> {
  const threshold = new Date(Date.now() - QUEUED_STALE_THRESHOLD_MS);

  const stale = await prisma.scheduledPost.findMany({
    where: {
      status: "QUEUED",
      updatedAt: { lt: threshold },
    },
  });

  if (stale.length === 0) return 0;

  for (const post of stale) {
    logWarn("Recovering stale QUEUED post", {
      scheduledPostId: post.id,
      updatedAt: post.updatedAt.toISOString(),
    });

    await prisma.scheduledPost.update({
      where: { id: post.id },
      data: { status: "SCHEDULED", bullJobId: null },
    });

    if (post.scheduledAt && post.scheduledAt > new Date()) {
      const delay = Math.max(0, post.scheduledAt.getTime() - Date.now());
      const job = await publishQueue.add(
        "publish",
        { scheduledPostId: post.id },
        { jobId: `post-${post.id}`, delay }
      );
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { bullJobId: job.id ?? `post-${post.id}` },
      });
    } else {
      await publishQueue.add(
        "publish",
        { scheduledPostId: post.id },
        { jobId: `post-${post.id}`, delay: 0 }
      );
    }
  }

  logInfo("Stale QUEUED recovery complete", { count: stale.length });
  return stale.length;
}

export function startQueuedRecoveryCron(
  publishQueue: Queue<PublishPostJobData>,
  intervalMs: number
): ReturnType<typeof setInterval> {
  return setInterval(() => {
    recoverStaleQueuedPosts(publishQueue).catch((err) => {
      logError("QUEUED recovery cron failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }, intervalMs);
}
