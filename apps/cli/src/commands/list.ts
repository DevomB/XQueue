import type { PostStatus } from "@postwave/core";
import pc from "picocolors";
import { createRuntime } from "../runtime.js";
import { formatDate } from "../util.js";

export type ListOptions = {
  status?: string;
  limit?: number;
  json?: boolean;
};

const VALID_STATUSES = new Set<PostStatus>([
  "SCHEDULED",
  "QUEUED",
  "PUBLISHED",
  "FAILED",
  "CANCELLED",
]);

export async function runList(options: ListOptions): Promise<void> {
  const runtime = await createRuntime();

  try {
    const status =
      options.status && VALID_STATUSES.has(options.status as PostStatus)
        ? (options.status as PostStatus)
        : undefined;

    const posts = await runtime.storage.repo.list({
      status,
      limit: options.limit ?? 50,
    });

    if (options.json) {
      console.log(
        JSON.stringify(
          posts.map((post) => ({
            id: post.id,
            text: post.text,
            status: post.status,
            scheduledAt: post.scheduledAt?.toISOString() ?? null,
            mediaPaths: post.mediaPaths,
            attemptCount: post.attemptCount,
            failureReason: post.failureReason,
            xTweetId: post.xTweetId,
            publishedAt: post.publishedAt?.toISOString() ?? null,
            updatedAt: post.updatedAt.toISOString(),
          })),
          null,
          2
        )
      );
      return;
    }

    if (posts.length === 0) {
      console.log(pc.dim("No posts found"));
      return;
    }

    for (const post of posts) {
      const statusColor =
        post.status === "PUBLISHED"
          ? pc.green
          : post.status === "FAILED"
            ? pc.red
            : post.status === "CANCELLED"
              ? pc.dim
              : pc.cyan;

      console.log(
        `${statusColor(post.status.padEnd(10))} ${post.id.slice(0, 8)}  ${formatDate(post.scheduledAt)}`
      );
      console.log(`           ${post.text.slice(0, 72)}${post.text.length > 72 ? "…" : ""}`);
      if (post.failureReason) {
        console.log(pc.red(`           ${post.failureReason}`));
      }
    }
  } finally {
    runtime.close();
  }
}
