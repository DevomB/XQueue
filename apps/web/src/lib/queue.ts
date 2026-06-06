import { Queue } from "bullmq";
import {
  PUBLISH_QUEUE_NAME,
  type PublishPostJobData,
} from "@xqueue/shared";

let publishQueue: Queue | null = null;

function getRedisUrl(): string {
  return process.env.REDIS_URL ?? "redis://localhost:6379";
}

export function getPublishQueue(): Queue {
  if (!publishQueue) {
    publishQueue = new Queue(PUBLISH_QUEUE_NAME, {
      connection: { url: getRedisUrl() },
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: "exponential", delay: 60_000 },
        removeOnComplete: 1000,
        removeOnFail: false,
      },
    });
  }
  return publishQueue;
}

export async function enqueuePublishJob(
  scheduledPostId: string,
  scheduledAt: Date
): Promise<string> {
  const delay = Math.max(0, scheduledAt.getTime() - Date.now());
  const job = await getPublishQueue().add(
    "publish",
    { scheduledPostId } satisfies PublishPostJobData,
    {
      jobId: `post-${scheduledPostId}`,
      delay,
    }
  );
  return job.id ?? `post-${scheduledPostId}`;
}

export async function removePublishJob(jobId: string | null | undefined) {
  if (!jobId) return;
  const job = await getPublishQueue().getJob(jobId);
  if (job) await job.remove();
}
