import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { getPidPath } from "./config.js";

export function writePidFile(dataDir: string, pid: number): void {
  writeFileSync(getPidPath(dataDir), String(pid), "utf8");
}

export function readPidFile(dataDir: string): number | null {
  const pidPath = getPidPath(dataDir);
  if (!existsSync(pidPath)) {
    return null;
  }
  const raw = readFileSync(pidPath, "utf8").trim();
  const pid = Number(raw);
  return Number.isInteger(pid) && pid > 0 ? pid : null;
}

export function removePidFile(dataDir: string): void {
  const pidPath = getPidPath(dataDir);
  if (existsSync(pidPath)) {
    unlinkSync(pidPath);
  }
}

export function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function getDaemonStatus(dataDir: string): {
  pid: number | null;
  running: boolean;
} {
  const pid = readPidFile(dataDir);
  if (!pid) {
    return { pid: null, running: false };
  }
  const running = isProcessRunning(pid);
  if (!running) {
    removePidFile(dataDir);
    return { pid: null, running: false };
  }
  return { pid, running: true };
}
