export const PUBLISH_QUEUE_NAME = "publish-post";
export const DEAD_LETTER_QUEUE_NAME = "publish-post-dlq";

export type PublishPostJobData = {
  scheduledPostId: string;
};

export const MAX_PUBLISH_ATTEMPTS = 5;

/** Posts stuck in QUEUED longer than this are considered stale and recovered. */
export const QUEUED_STALE_THRESHOLD_MS = 10 * 60 * 1000;

export const QUEUED_RECOVERY_INTERVAL_MS = 5 * 60 * 1000;
