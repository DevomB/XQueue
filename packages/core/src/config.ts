import { homedir } from "os";
import { readFile } from "fs/promises";
import path from "path";
import { z } from "zod";

export type XCredentials = {
  clientId: string;
  clientSecret: string;
  callbackUrl?: string;
};

const resendConfigSchema = z.object({
  apiKey: z.string().min(1),
  from: z.string().min(1),
});

const xConfigSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  callbackUrl: z.string().url().optional(),
});

export const configSchema = z.object({
  dataDir: z.string().optional(),
  tokenEncryptionKey: z.string().min(1),
  x: xConfigSchema,
  timezone: z.string().optional(),
  notifyEmail: z.string().email().optional(),
  appUrl: z.string().url().optional(),
  resend: resendConfigSchema.optional(),
  schedulerPollIntervalMs: z.number().int().positive().optional(),
  recoveryIntervalMs: z.number().int().positive().optional(),
  autostart: z.boolean().optional(),
  onboardingCompleted: z.boolean().optional(),
});

export type PostwaveConfig = z.infer<typeof configSchema>;

const DEFAULT_CONFIG_PATH = path.join(homedir(), ".postwave", "config.json");

export function getConfigPath(): string {
  return process.env.POSTWAVE_CONFIG_PATH ?? DEFAULT_CONFIG_PATH;
}

export function getDataDir(config?: Pick<PostwaveConfig, "dataDir">): string {
  if (config?.dataDir) {
    return config.dataDir;
  }
  if (process.env.POSTWAVE_DATA_DIR) {
    return process.env.POSTWAVE_DATA_DIR;
  }
  return path.join(homedir(), ".postwave", "data");
}

function envOverrides(): Record<string, unknown> {
  const overrides: Record<string, unknown> = {};

  if (process.env.POSTWAVE_DATA_DIR) {
    overrides.dataDir = process.env.POSTWAVE_DATA_DIR;
  }
  if (process.env.TOKEN_ENCRYPTION_KEY) {
    overrides.tokenEncryptionKey = process.env.TOKEN_ENCRYPTION_KEY;
  }
  if (process.env.NOTIFY_EMAIL) {
    overrides.notifyEmail = process.env.NOTIFY_EMAIL;
  }
  if (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL) {
    overrides.appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  }

  const x: Record<string, string> = {};
  if (process.env.X_CLIENT_ID) x.clientId = process.env.X_CLIENT_ID;
  if (process.env.X_CLIENT_SECRET) x.clientSecret = process.env.X_CLIENT_SECRET;
  if (process.env.X_CALLBACK_URL) x.callbackUrl = process.env.X_CALLBACK_URL;
  if (Object.keys(x).length > 0) {
    overrides.x = x;
  }

  const resend: Record<string, string> = {};
  if (process.env.RESEND_API_KEY) resend.apiKey = process.env.RESEND_API_KEY;
  if (process.env.EMAIL_FROM) resend.from = process.env.EMAIL_FROM;
  if (Object.keys(resend).length > 0) {
    overrides.resend = resend;
  }

  if (process.env.SCHEDULER_POLL_INTERVAL_MS) {
    overrides.schedulerPollIntervalMs = Number(
      process.env.SCHEDULER_POLL_INTERVAL_MS
    );
  }
  if (process.env.RECOVERY_INTERVAL_MS) {
    overrides.recoveryIntervalMs = Number(process.env.RECOVERY_INTERVAL_MS);
  }

  return overrides;
}

function deepMerge(
  base: Record<string, unknown>,
  overrides: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...base };

  for (const [key, value] of Object.entries(overrides)) {
    const existing = result[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      existing &&
      typeof existing === "object" &&
      !Array.isArray(existing)
    ) {
      result[key] = deepMerge(
        existing as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else {
      result[key] = value;
    }
  }

  return result;
}

export async function loadConfig(
  configPath = getConfigPath()
): Promise<PostwaveConfig> {
  let fileConfig: Record<string, unknown> = {};

  try {
    const raw = await readFile(configPath, "utf8");
    fileConfig = JSON.parse(raw) as Record<string, unknown>;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      throw err;
    }
  }

  const merged = deepMerge(fileConfig, envOverrides());
  return configSchema.parse(merged);
}

export function toXCredentials(config: PostwaveConfig): XCredentials {
  return config.x;
}
