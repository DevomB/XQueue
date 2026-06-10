import "dotenv/config";
import { createServer } from "node:http";
import path from "node:path";
import {
  createEmailNotifier,
  createEncryption,
  createLocalMediaStorage,
  createPublisher,
  createTokenService,
  getDataDir,
  loadConfig,
  logError,
  logInfo,
  toXCredentials,
} from "@postwave/core";
import { createSqliteStorage } from "@postwave/storage-sqlite";
import { QUEUED_RECOVERY_INTERVAL_MS } from "@postwave/shared";

const healthPort = Number(process.env.WORKER_HEALTH_PORT ?? 8081);

async function main(): Promise<void> {
  const config = await loadConfig();
  const dataDir =
    process.env.POSTWAVE_DATA_DIR ?? getDataDir(config);
  const storage = createSqliteStorage(dataDir);

  const { encrypt, decrypt } = createEncryption({
    key: config.tokenEncryptionKey,
  });

  const tokenService = createTokenService({
    tokenStore: storage.tokenStore,
    credentials: toXCredentials(config),
    encrypt,
    decrypt,
  });

  const mediaStorage = createLocalMediaStorage({
    mediaDir: path.join(dataDir, "media"),
  });

  const emailNotifier = config.resend?.apiKey
    ? createEmailNotifier({
        apiKey: config.resend.apiKey,
        from: config.resend.from,
        appUrl: config.appUrl,
      })
    : undefined;

  const publisher = createPublisher({
    postRepository: storage.repo,
    tokenService,
    mediaStorage,
    emailNotifier,
    notifyEmail: config.notifyEmail,
  });

  const recoveryIntervalMs =
    config.recoveryIntervalMs ?? QUEUED_RECOVERY_INTERVAL_MS;

  await storage.scheduler.recoverStaleQueued();
  storage.scheduler.rebuildHeapFromDb();
  storage.scheduler.start((postId) => publisher.publishPost(postId));

  const recoveryTimer = setInterval(() => {
    void storage.scheduler.recoverStaleQueued();
  }, recoveryIntervalMs);

  const healthServer = createServer((req, res) => {
    if (req.url !== "/health" && req.url !== "/") {
      res.writeHead(404);
      res.end();
      return;
    }

    const nextRunAt = storage.scheduler.nextRunAt();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "postwave-daemon",
        nextRunAt: nextRunAt?.toISOString() ?? null,
      })
    );
  });

  healthServer.listen(healthPort, () => {
    logInfo("PostWave deploy daemon started", { dataDir, healthPort });
  });

  const shutdown = () => {
    clearInterval(recoveryTimer);
    storage.scheduler.stop();
    storage.db.close();
    healthServer.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  logError("Daemon failed to start", {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
