import { readFile } from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import { postTextSchema } from "@postwave/shared";
import { assertMediaCount } from "@postwave/core";
import { createRuntime } from "../runtime.js";
import { exitWithError } from "../util.js";

export type AddOptions = {
  text?: string;
  at?: string;
  media?: string[];
};

function parseScheduledAt(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    exitWithError(`Invalid --at value: ${value}`);
  }
  if (date <= new Date()) {
    exitWithError("Scheduled time must be in the future");
  }
  return date;
}

async function saveMediaFiles(
  mediaPaths: string[],
  mediaStorage: Awaited<ReturnType<typeof createRuntime>>["mediaStorage"]
): Promise<string[]> {
  const saved: string[] = [];
  assertMediaCount(mediaPaths.length);

  for (const filePath of mediaPaths) {
    const resolved = path.resolve(filePath);
    const buffer = await readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const mimeType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : "image/jpeg";
    saved.push(await mediaStorage.saveMedia(buffer, mimeType));
  }

  return saved;
}

export async function runAdd(options: AddOptions): Promise<void> {
  if (!options.text?.trim()) {
    exitWithError("--text is required");
  }

  const parsed = postTextSchema.safeParse(options.text);
  if (!parsed.success) {
    exitWithError(parsed.error.errors[0]?.message ?? "Invalid post text");
  }

  const scheduledAt = options.at ? parseScheduledAt(options.at) : null;
  const runtime = await createRuntime();

  try {
    const mediaPaths = options.media?.length
      ? await saveMediaFiles(options.media, runtime.mediaStorage)
      : [];

    const post = await runtime.storage.repo.create({
      text: parsed.data,
      scheduledAt,
      mediaPaths,
    });

    if (scheduledAt) {
      runtime.storage.scheduler.schedule(post.id, scheduledAt);
    }

    console.log(pc.green(`Scheduled post ${post.id}`));
    if (scheduledAt) {
      console.log(pc.dim(`  At: ${scheduledAt.toISOString()}`));
    } else {
      console.log(pc.dim("  No schedule set (draft)"));
    }
  } finally {
    runtime.close();
  }
}
