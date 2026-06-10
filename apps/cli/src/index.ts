import { Command } from "commander";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pc from "picocolors";
import { runAdd } from "./commands/add.js";
import { runCancel } from "./commands/cancel.js";
import { runCatchUp } from "./commands/catch-up.js";
import { runDaemonCommand } from "./commands/daemon.js";
import { runDeployCommand } from "./commands/deploy.js";
import { runImport } from "./commands/import-cmd.js";
import { runInit } from "./commands/init.js";
import { runList } from "./commands/list.js";
import { runLogin } from "./commands/login.js";
import { runRetry } from "./commands/retry.js";
import { runStatus } from "./commands/status.js";

function readVersion(): string {
  try {
    const pkgPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "package.json"
    );
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };
    return pkg.version;
  } catch {
    return "0.0.0";
  }
}

async function main(): Promise<void> {
  const program = new Command();

  program
    .name("postwave")
    .description("PostWave CLI — schedule and publish posts to X")
    .version(readVersion());

  program
    .command("init")
    .description("Create ~/.postwave, config, and SQLite database")
    .option("--force", "Overwrite existing config")
    .option("--x-client-id <id>", "X OAuth client ID")
    .option("--x-client-secret <secret>", "X OAuth client secret")
    .action(async (opts) => {
      await runInit(opts);
    });

  program
    .command("login")
    .description("Connect your X account via OAuth PKCE")
    .action(async () => {
      await runLogin();
    });

  program
    .command("status")
    .description("Show account, queue, and daemon status")
    .action(async () => {
      await runStatus();
    });

  program
    .command("add")
    .description("Schedule a single post")
    .requiredOption("--text <text>", "Post text")
    .option("--at <iso>", "ISO 8601 schedule time")
    .option("--media <paths...>", "Image file paths")
    .action(async (opts) => {
      await runAdd(opts);
    });

  program
    .command("import [file]")
    .description("Import posts from a file or stdin (use - for stdin)")
    .option("--timezone <tz>", "IANA timezone for date lines", "UTC")
    .action(async (file, opts) => {
      await runImport({ file, ...opts });
    });

  program
    .command("list")
    .description("List scheduled posts")
    .option("--status <status>", "Filter by status")
    .option("--limit <n>", "Max rows", (v) => Number(v), 50)
    .option("--json", "Output JSON")
    .action(async (opts) => {
      await runList(opts);
    });

  program
    .command("cancel <id>")
    .description("Cancel a scheduled or failed post")
    .action(async (id) => {
      await runCancel(id);
    });

  program
    .command("retry <id>")
    .description("Retry a failed post")
    .action(async (id) => {
      await runRetry(id);
    });

  const daemon = program
    .command("daemon")
    .description("Run the scheduling daemon in the foreground");

  daemon
    .command("install")
    .description("Write systemd unit or Windows Task Scheduler XML")
    .action(async () => {
      await runDaemonCommand("install");
    });

  daemon.action(async () => {
    await runDaemonCommand();
  });

  program
    .command("catch-up")
    .description("Publish missed scheduled posts")
    .option("--yes", "Skip confirmation")
    .action(async (opts) => {
      await runCatchUp(opts);
    });

  const deploy = program.command("deploy").description("Deployment helpers");

  deploy
    .command("fly")
    .description("Write Fly.io templates to infra/deploy/fly")
    .action(async () => {
      await runDeployCommand("fly");
    });

  deploy
    .command("docker")
    .description("Print docker run and compose snippets")
    .action(async () => {
      await runDeployCommand("docker");
    });

  try {
    await program.parseAsync(process.argv);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(pc.red(message));
    process.exit(1);
  }
}

main();
