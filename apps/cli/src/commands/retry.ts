import pc from "picocolors";
import { createRuntime } from "../runtime.js";
import { exitWithError } from "../util.js";

export async function runRetry(postId: string): Promise<void> {
  if (!postId) {
    exitWithError("Post ID is required");
  }

  const runtime = await createRuntime();

  try {
    let resolvedId = postId;
    const post = await runtime.storage.repo.findById(postId);
    if (!post) {
      const all = await runtime.storage.repo.list({ status: "FAILED", limit: 200 });
      const match = all.find((p) => p.id.startsWith(postId));
      if (!match) {
        exitWithError(`Failed post not found: ${postId}`);
      }
      resolvedId = match.id;
    }

    const retried = await runtime.storage.repo.retry(resolvedId);
    if (!retried) {
      exitWithError(`Cannot retry post ${resolvedId} (not FAILED)`);
    }

    const updated = await runtime.storage.repo.findById(resolvedId);
    if (updated?.scheduledAt) {
      runtime.storage.scheduler.schedule(resolvedId, updated.scheduledAt);
    }

    console.log(pc.green(`Post ${resolvedId} queued for retry`));
  } finally {
    runtime.close();
  }
}
