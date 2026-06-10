import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import pc from "picocolors";

const execFileAsync = promisify(execFile);

export async function openBrowser(url: string): Promise<void> {
  const platform = process.platform;
  try {
    if (platform === "win32") {
      await execFileAsync("cmd", ["/c", "start", "", url], {
        windowsHide: true,
      });
    } else if (platform === "darwin") {
      await execFileAsync("open", [url]);
    } else {
      await execFileAsync("xdg-open", [url]);
    }
  } catch {
    console.log(pc.dim(`Open this URL in your browser: ${url}`));
  }
}

export async function readInput(filePath?: string): Promise<string> {
  if (filePath && filePath !== "-") {
    return readFile(filePath, "utf8");
  }
  if (filePath === "-" || !process.stdin.isTTY) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString("utf8");
  }
  throw new Error("No input file provided and stdin is empty");
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) {
    return pc.dim("—");
  }
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}

export function exitWithError(message: string): never {
  console.error(pc.red(message));
  process.exit(1);
}
