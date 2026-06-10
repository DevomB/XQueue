import pc from "picocolors";
import ora from "ora";
import { parseBulkPaste } from "@postwave/shared";
import { createRuntime } from "../runtime.js";
import { exitWithError, readInput } from "../util.js";

export type ImportOptions = {
  file?: string;
  timezone?: string;
};

export async function runImport(options: ImportOptions): Promise<void> {
  const input = await readInput(options.file);
  if (!input.trim()) {
    exitWithError("No input to import");
  }

  const timezone = options.timezone ?? "UTC";
  const lines = parseBulkPaste(input, timezone);
  const valid = lines.filter((line) => !line.error);
  const invalid = lines.filter((line) => line.error);

  if (valid.length === 0) {
    exitWithError("No valid lines to import");
  }

  const spinner = ora(`Importing ${valid.length} post(s)`).start();
  const runtime = await createRuntime();

  try {
    let created = 0;
    for (const line of valid) {
      const post = await runtime.storage.repo.create({
        text: line.text,
        scheduledAt: line.scheduledAt ?? null,
      });
      if (line.scheduledAt) {
        runtime.storage.scheduler.schedule(post.id, line.scheduledAt);
      }
      created++;
    }

    spinner.succeed(`Imported ${created} post(s)`);
    if (invalid.length > 0) {
      console.log(pc.yellow(`Skipped ${invalid.length} invalid line(s):`));
      for (const line of invalid) {
        console.log(
          pc.dim(`  line ${line.lineNumber}: ${line.error} — ${line.raw.slice(0, 50)}`)
        );
      }
    }
  } catch (err) {
    spinner.fail("Import failed");
    throw err;
  } finally {
    runtime.close();
  }
}
