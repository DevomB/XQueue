import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pc from "picocolors";
import ora from "ora";
import { getPostwaveDir, readConfig } from "../config.js";
import { getDaemonStatus, removePidFile, writePidFile } from "../pid.js";
import { createDaemonContext } from "../runtime.js";
import { exitWithError } from "../util.js";

function cliExecutable(): string {
  const entry = fileURLToPath(import.meta.url);
  return process.argv[1] ?? path.join(path.dirname(entry), "..", "index.js");
}

export async function runDaemonForeground(): Promise<void> {
  const config = await readConfig();
  const ctx = await createDaemonContext(config);
  const existing = getDaemonStatus(ctx.dataDir);

  if (existing.running) {
    exitWithError(`Daemon already running (pid ${existing.pid})`);
  }

  writePidFile(ctx.dataDir, process.pid);

  const shutdown = () => {
    console.log(pc.dim("\nShutting down daemon…"));
    ctx.stopDaemon();
    removePidFile(ctx.dataDir);
    ctx.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await ctx.startDaemon();
  console.log(pc.green(`PostWave daemon running (pid ${process.pid})`));
  console.log(pc.dim("Press Ctrl+C to stop"));
}

export async function runDaemonInstall(): Promise<void> {
  const config = await readConfig();
  const postwaveDir = getPostwaveDir();
  const dataDir = config.dataDir ?? path.join(postwaveDir, "data");
  const executable = cliExecutable();

  if (process.platform === "win32") {
    const taskName = "PostWave";
    const xmlPath = path.join(postwaveDir, "postwave-daemon.xml");
    const xml = `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <Triggers>
    <LogonTrigger>
      <Enabled>true</Enabled>
    </LogonTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <RestartOnFailure>
      <Interval>PT1M</Interval>
      <Count>3</Count>
    </RestartOnFailure>
    <Enabled>true</Enabled>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>node</Command>
      <Arguments>"${executable}" daemon</Arguments>
      <WorkingDirectory>${postwaveDir}</WorkingDirectory>
    </Exec>
  </Actions>
</Task>`;
    writeFileSync(xmlPath, xml, "utf8");
    console.log(pc.green("Windows Task Scheduler XML written"));
    console.log(pc.dim(`  ${xmlPath}`));
    console.log();
    console.log("Register with:");
    console.log(
      pc.cyan(`  schtasks /Create /TN "${taskName}" /XML "${xmlPath}" /F`)
    );
    return;
  }

  const unitDir = path.join(homedir(), ".config", "systemd", "user");
  mkdirSync(unitDir, { recursive: true });
  const unitPath = path.join(unitDir, "postwave.service");
  const unit = `[Unit]
Description=PostWave scheduling daemon
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/env node ${executable} daemon
WorkingDirectory=${postwaveDir}
Environment=POSTWAVE_DATA_DIR=${dataDir}
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
`;
  writeFileSync(unitPath, unit, "utf8");
  chmodSync(unitPath, 0o644);

  console.log(pc.green("systemd user unit written"));
  console.log(pc.dim(`  ${unitPath}`));
  console.log();
  console.log("Enable with:");
  console.log(pc.cyan("  systemctl --user daemon-reload"));
  console.log(pc.cyan("  systemctl --user enable --now postwave.service"));
}

export async function runDaemonCommand(subcommand?: string): Promise<void> {
  if (subcommand === "install") {
    const spinner = ora("Installing daemon service").start();
    try {
      await runDaemonInstall();
      spinner.stop();
    } catch (err) {
      spinner.fail("Install failed");
      throw err;
    }
    return;
  }

  if (subcommand && subcommand !== "run") {
    exitWithError(`Unknown daemon subcommand: ${subcommand}`);
  }

  await runDaemonForeground();
}
