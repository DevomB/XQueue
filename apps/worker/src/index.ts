import "dotenv/config";
import { Worker, Queue } from "bullmq";
import {
  DEAD_LETTER_QUEUE_NAME,
  PUBLISH_QUEUE_NAME,
  type PublishPostJobData,
} from "@postwave/shared";
import { processPublishJob } from "./publish-job.js";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const connection = { url: redisUrl };

const concurrency = Number(process.env.WORKER_CONCURRENCY ?? 5);

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

worker.on("failed", async (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
  if (job && job.attemptsMade >= (job.opts.attempts ?? 5)) {
    await dlq.add("dead-letter", {
      ...job.data,
      error: err.message,
      failedAt: new Date().toISOString(),
    });
  }
});

worker.on("completed", (job) => {
  console.log(`Published post job ${job.id} completed`);
});

console.log(`PostWave worker started (concurrency: ${concurrency})`);

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
