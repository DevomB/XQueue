import "dotenv/config";
import { createServer } from "http";
import { Worker, Queue } from "bullmq";
import {
  DEAD_LETTER_QUEUE_NAME,
  PUBLISH_QUEUE_NAME,
  QUEUED_RECOVERY_INTERVAL_MS,
  type PublishPostJobData,
} from "@postwave/shared";
import { logError, logInfo } from "./lib/logger.js";
import { markFailedFromDlq, processPublishJob } from "./publish-job.js";
import {
  recoverStaleQueuedPosts,
  startQueuedRecoveryCron,
} from "./recover-queued.js";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const connection = { url: redisUrl };

const concurrency = Number(process.env.WORKER_CONCURRENCY ?? 5);
const healthPort = Number(process.env.WORKER_HEALTH_PORT ?? 8081);

const publishQueue = new Queue<PublishPostJobData>(PUBLISH_QUEUE_NAME, {
  connection,
});

const dlq = new Queue(DEAD_LETTER_QUEUE_NAME, { connection });

const worker = new Worker<PublishPostJobData>(
  PUBLISH_QUEUE_NAME,
  async (job) => {
    await processPublishJob(job.data.scheduledPostId);
  },
  {
    connection,
    concurrency,
  }
);

const dlqWorker = new Worker(
  DEAD_LETTER_QUEUE_NAME,
  async (job) => {
    const data = job.data as PublishPostJobData & {
      error?: string;
      scheduledPostId?: string;
    };
    const postId = data.scheduledPostId ?? job.data?.scheduledPostId;
    if (!postId) return;

    const reason = data.error ?? "Job moved to dead-letter queue after max retries";
    logError("DLQ job received", { scheduledPostId: postId, reason });
    await markFailedFromDlq(postId, reason);
  },
  { connection, concurrency: 1 }
);

worker.on("failed", async (job, err) => {
  logError("BullMQ job failed", {
    jobId: job?.id,
    scheduledPostId: job?.data?.scheduledPostId,
    attemptsMade: job?.attemptsMade,
    error: err.message,
  });
  if (job && job.attemptsMade >= (job.opts.attempts ?? 5)) {
    await dlq.add("dead-letter", {
      ...job.data,
      error: err.message,
      failedAt: new Date().toISOString(),
    });
  }
});

worker.on("completed", (job) => {
  logInfo("BullMQ job completed", {
    jobId: job.id,
    scheduledPostId: job.data.scheduledPostId,
  });
});

recoverStaleQueuedPosts(publishQueue).catch((err) => {
  logError("Initial QUEUED recovery failed", {
    error: err instanceof Error ? err.message : String(err),
  });
});

const recoveryInterval = startQueuedRecoveryCron(
  publishQueue,
  QUEUED_RECOVERY_INTERVAL_MS
);

const healthServer = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok", service: "postwave-worker" }));
});

healthServer.listen(healthPort, () => {
  logInfo("PostWave worker started", { concurrency, healthPort });
});

process.on("SIGTERM", async () => {
  clearInterval(recoveryInterval);
  await worker.close();
  await dlqWorker.close();
  await publishQueue.close();
  await dlq.close();
  healthServer.close();
  process.exit(0);
});
