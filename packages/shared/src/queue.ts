export const PUBLISH_QUEUE_NAME = "publish-post";
export const DEAD_LETTER_QUEUE_NAME = "publish-post-dlq";

export type PublishPostJobData = {
  scheduledPostId: string;
};

export const MAX_PUBLISH_ATTEMPTS = 5;
