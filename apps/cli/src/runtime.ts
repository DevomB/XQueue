import {
  createEmailNotifier,
  createEncryption,
  createLocalMediaStorage,
  createPublisher,
  createTokenService,
  toXCredentials,
  type PostwaveConfig,
} from "@postwave/core";
import { QUEUED_RECOVERY_INTERVAL_MS } from "@postwave/shared";
import {
  createSqliteStorage,
  type SqliteStorage,
} from "@postwave/storage-sqlite";
import { ensureDataDir, getMediaDir, readConfig } from "./config.js";
import { startIpcServer } from "./ipc-server.js";
import type { Server } from "node:http";

export type RuntimeContext = {
  config: PostwaveConfig;
  dataDir: string;
  storage: SqliteStorage;
  tokenService: ReturnType<typeof createTokenService>;
  mediaStorage: ReturnType<typeof createLocalMediaStorage>;
  publisher: ReturnType<typeof createPublisher>;
  close: () => void;
};

export type DaemonContext = RuntimeContext & {
  recoveryTimer: ReturnType<typeof setInterval> | null;
  ipcServer: Server | null;
  startDaemon: () => Promise<void>;
  stopDaemon: () => void;
};

export function createStorage(dataDir: string): SqliteStorage {
  return createSqliteStorage(dataDir);
}

export async function createRuntime(
  config?: PostwaveConfig
): Promise<RuntimeContext> {
  const resolved = config ?? (await readConfig());
  const dataDir = ensureDataDir(resolved);
  const storage = createStorage(dataDir);
  const { encrypt, decrypt } = createEncryption({
    key: resolved.tokenEncryptionKey,
  });
  const tokenService = createTokenService({
    tokenStore: storage.tokenStore,
    credentials: toXCredentials(resolved),
    encrypt,
    decrypt,
  });
  const mediaStorage = createLocalMediaStorage({
    mediaDir: getMediaDir(dataDir),
  });
  const emailNotifier = resolved.resend?.apiKey
    ? createEmailNotifier({
        apiKey: resolved.resend.apiKey,
        from: resolved.resend.from,
        appUrl: resolved.appUrl,
      })
    : undefined;
  const publisher = createPublisher({
    postRepository: storage.repo,
    tokenService,
    mediaStorage,
    emailNotifier,
    notifyEmail: resolved.notifyEmail,
  });

  return {
    config: resolved,
    dataDir,
    storage,
    tokenService,
    mediaStorage,
    publisher,
    close: () => storage.db.close(),
  };
}

export async function createDaemonContext(
  config?: PostwaveConfig
): Promise<DaemonContext> {
  const runtime = await createRuntime(config);
  const recoveryIntervalMs =
    runtime.config.recoveryIntervalMs ?? QUEUED_RECOVERY_INTERVAL_MS;

  let recoveryTimer: ReturnType<typeof setInterval> | null = null;
  let ipcServer: Server | null = null;

  return {
    ...runtime,
    recoveryTimer,
    ipcServer,
    async startDaemon() {
      await runtime.storage.scheduler.recoverStaleQueued();
      runtime.storage.scheduler.rebuildHeapFromDb();
      runtime.storage.scheduler.start((postId) =>
        runtime.publisher.publishPost(postId)
      );
      recoveryTimer = setInterval(() => {
        void runtime.storage.scheduler.recoverStaleQueued();
      }, recoveryIntervalMs);

      const ipcPort = Number(process.env.POSTWAVE_IPC_PORT ?? 0);
      if (ipcPort > 0) {
        ipcServer = startIpcServer(runtime, ipcPort);
      }
    },
    stopDaemon() {
      if (recoveryTimer) {
        clearInterval(recoveryTimer);
        recoveryTimer = null;
      }
      ipcServer?.close();
      ipcServer = null;
      runtime.storage.scheduler.stop();
    },
  };
}
