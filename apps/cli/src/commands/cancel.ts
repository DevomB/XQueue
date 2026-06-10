import pc from "picocolors";
import { createRuntime } from "../runtime.js";
import { exitWithError } from "../util.js";

export async function runCancel(postId: string): Promise<void> {
  if (!postId) {
    exitWithError("Post ID is required");
  }

  const runtime = await createRuntime();

  try {
    let resolvedId = postId;
    const post = await runtime.storage.repo.findById(postId);
    if (!post) {
      const all = await runtime.storage.repo.list({ limit: 200 });
      const match = all.find((p) => p.id.startsWith(postId));
      if (!match) {
        exitWithError(`Post not found: ${postId}`);
      }
      resolvedId = match.id;
    }

    const cancelled = await runtime.storage.repo.cancel(resolvedId);
    if (!cancelled) {
      exitWithError(`Cannot cancel post ${resolvedId} (not SCHEDULED or FAILED)`);
    }

    runtime.storage.scheduler.cancel(resolvedId);
    console.log(pc.green(`Cancelled post ${resolvedId}`));
  } finally {
    runtime.close();
  }
}
