import pc from "picocolors";
import ora from "ora";
import { createRuntime } from "../runtime.js";
import { formatDate } from "../util.js";

export type CatchUpOptions = {
  yes?: boolean;
};

export async function runCatchUp(options: CatchUpOptions): Promise<void> {
  const runtime = await createRuntime();

  try {
    const missed = await runtime.storage.repo.findMissedPosts();

    if (missed.length === 0) {
      console.log(pc.green("No missed posts"));
      return;
    }

    console.log(pc.yellow(`${missed.length} missed post(s):`));
    for (const post of missed) {
      console.log(
        `  ${post.id.slice(0, 8)}  ${formatDate(post.scheduledAt)}  ${post.text.slice(0, 50)}`
      );
    }

    if (!options.yes) {
      console.log();
      console.log(pc.dim("Re-run with --yes to publish missed posts now."));
      return;
    }

    const spinner = ora("Publishing missed posts").start();
    let published = 0;
    let failed = 0;

    for (let i = 0; i < missed.length; i++) {
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 6_000));
      }
      const post = missed[i];
      try {
        await runtime.publisher.publishPost(post.id);
        const updated = await runtime.storage.repo.findById(post.id);
        if (updated?.status === "PUBLISHED") {
          published++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    if (failed > 0) {
      spinner.warn(`Published ${published}, failed ${failed}`);
    } else {
      spinner.succeed(`Published ${published} post(s)`);
    }
  } finally {
    runtime.close();
  }
}
