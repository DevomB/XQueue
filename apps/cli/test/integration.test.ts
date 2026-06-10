import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { configExists, getConfigPath, readConfig } from "../src/config.js";
import { runInit } from "../src/commands/init.js";
import { runAdd } from "../src/commands/add.js";
import { runList } from "../src/commands/list.js";
import { runCancel } from "../src/commands/cancel.js";
import { runStatus } from "../src/commands/status.js";
import { createStorage } from "../src/runtime.js";

describe("postwave CLI integration", () => {
  let tempHome: string;
  let originalHome: string | undefined;
  let originalConfigPath: string | undefined;
  let originalDataDir: string | undefined;

  beforeEach(() => {
    tempHome = mkdtempSync(join(tmpdir(), "postwave-cli-"));
    originalHome = process.env.HOME;
    originalConfigPath = process.env.POSTWAVE_CONFIG_PATH;
    originalDataDir = process.env.POSTWAVE_DATA_DIR;

    process.env.HOME = tempHome;
    process.env.USERPROFILE = tempHome;
    process.env.POSTWAVE_CONFIG_PATH = join(tempHome, ".postwave", "config.json");
    process.env.POSTWAVE_DATA_DIR = join(tempHome, ".postwave", "data");
  });

  afterEach(() => {
    if (originalHome === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = originalHome;
    }
    if (originalConfigPath === undefined) {
      delete process.env.POSTWAVE_CONFIG_PATH;
    } else {
      process.env.POSTWAVE_CONFIG_PATH = originalConfigPath;
    }
    if (originalDataDir === undefined) {
      delete process.env.POSTWAVE_DATA_DIR;
    } else {
      process.env.POSTWAVE_DATA_DIR = originalDataDir;
    }
    try {
      rmSync(tempHome, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } catch {
      // SQLite WAL files may remain locked briefly on Windows
    }
  });

  it("init creates config and sqlite database", async () => {
    await runInit({
      xClientId: "test-client",
      xClientSecret: "test-secret",
    });

    expect(configExists()).toBe(true);
    const config = await readConfig();
    expect(config.x.clientId).toBe("test-client");
    expect(config.tokenEncryptionKey.length).toBeGreaterThan(0);

    const storage = createStorage(process.env.POSTWAVE_DATA_DIR!);
    storage.db.close();
  });

  it("add, list, cancel, and status work end-to-end", async () => {
    await runInit({
      xClientId: "test-client",
      xClientSecret: "test-secret",
    });

    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await runAdd({
      text: "Hello from integration test",
      at: future,
    });

    const storage = createStorage(process.env.POSTWAVE_DATA_DIR!);
    const posts = await storage.repo.list({ limit: 10 });
    storage.db.close();
    expect(posts).toHaveLength(1);
    expect(posts[0]?.text).toBe("Hello from integration test");

    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    };

    try {
      await runList({ json: true });
      await runStatus();
    } finally {
      console.log = originalLog;
    }

    const postId = posts[0]!.id;
    await runCancel(postId);

    const afterCancel = createStorage(process.env.POSTWAVE_DATA_DIR!);
    const cancelled = await afterCancel.repo.findById(postId);
    afterCancel.db.close();
    expect(cancelled?.status).toBe("CANCELLED");
  });

  it("init refuses to overwrite without --force", async () => {
    await runInit({ xClientId: "a", xClientSecret: "b" });
    await expect(
      runInit({ xClientId: "c", xClientSecret: "d" })
    ).rejects.toThrow(/already exists/);
    const config = await readConfig();
    expect(config.x.clientId).toBe("a");
    expect(getConfigPath()).toContain(tempHome);
  });
});
