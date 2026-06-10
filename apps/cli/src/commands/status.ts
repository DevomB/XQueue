import pc from "picocolors";
import { createRuntime } from "../runtime.js";
import { getDaemonStatus } from "../pid.js";
import { formatDate } from "../util.js";

export async function runStatus(): Promise<void> {
  const runtime = await createRuntime();

  try {
    const tokens = await runtime.storage.tokenStore.getTokens();
    const username = tokens?.xUsername ?? pc.dim("not connected");
    const next = await runtime.storage.repo.findNextScheduled();
    const missed = await runtime.storage.repo.countMissed();
    const daemon = getDaemonStatus(runtime.dataDir);

    console.log(`${pc.bold("X account")}     @${username}`);
    console.log(
      `${pc.bold("Next post")}     ${
        next
          ? `${formatDate(next.scheduledAt)} — ${next.text.slice(0, 60)}${next.text.length > 60 ? "…" : ""}`
          : pc.dim("none scheduled")
      }`
    );
    console.log(
      `${pc.bold("Missed")}        ${missed > 0 ? pc.yellow(String(missed)) : "0"}`
    );
    console.log(
      `${pc.bold("Daemon")}        ${
        daemon.running
          ? `${pc.green("running")} (pid ${daemon.pid})`
          : pc.dim("stopped")
      }`
    );
  } finally {
    runtime.close();
  }
}
