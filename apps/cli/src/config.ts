import { randomBytes } from "node:crypto";
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import {
  configSchema,
  getConfigPath,
  getDataDir,
  loadConfig,
  type PostwaveConfig,
} from "@postwave/core";

export { getConfigPath, getDataDir, loadConfig, type PostwaveConfig };

export function getPostwaveDir(): string {
  return path.join(homedir(), ".postwave");
}

export function getPidPath(dataDir?: string): string {
  return path.join(dataDir ?? getDataDir(), "daemon.pid");
}

export function getMediaDir(dataDir?: string): string {
  return path.join(dataDir ?? getDataDir(), "media");
}

export type DefaultConfigOptions = {
  xClientId?: string;
  xClientSecret?: string;
  callbackPort?: number;
};

export function defaultConfig(
  options: DefaultConfigOptions = {}
): PostwaveConfig {
  const port = options.callbackPort ?? 3847;
  return {
    tokenEncryptionKey: randomBytes(32).toString("base64"),
    x: {
      clientId: options.xClientId ?? "",
      clientSecret: options.xClientSecret ?? "",
      callbackUrl: `http://127.0.0.1:${port}/callback`,
    },
  };
}

export async function readConfig(): Promise<PostwaveConfig> {
  return loadConfig(getConfigPath());
}

export function writeConfig(config: PostwaveConfig): void {
  const configPath = getConfigPath();
  const dir = path.dirname(configPath);
  mkdirSync(dir, { recursive: true });
  if (process.platform !== "win32") {
    chmodSync(dir, 0o700);
  }
  const parsed = configSchema.parse(config);
  writeFileSync(configPath, `${JSON.stringify(parsed, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
}

export function configExists(): boolean {
  try {
    readFileSync(getConfigPath());
    return true;
  } catch {
    return false;
  }
}

export function ensureDataDir(config?: Pick<PostwaveConfig, "dataDir">): string {
  const dataDir = getDataDir(config);
  mkdirSync(dataDir, { recursive: true });
  if (process.platform !== "win32") {
    chmodSync(dataDir, 0o700);
  }
  mkdirSync(getMediaDir(dataDir), { recursive: true });
  return dataDir;
}
