import { QUEUED_RECOVERY_INTERVAL_MS } from "@postwave/shared";
import type { PostRepository, Scheduler } from "./ports.js";
import type { PublisherDeps } from "./publish/publisher.js";
import { createPublisher } from "./publish/publisher.js";
import { createRecovery, startRecoveryInterval } from "./publish/recovery.js";
import { logError, logInfo } from "./logger.js";

export type DaemonDeps = PublisherDeps & {
  postRepository: PostRepository;
  pollIntervalMs?: number;
  recoveryIntervalMs?: number;
};

export type Daemon = {
  scheduler: Scheduler;
  start: () => Promise<void>;
  stop: () => void;
  publishPost: (postId: string) => Promise<void>;
  recoverStaleQueued: () => Promise<number>;
};

function createIntervalScheduler(
  postRepository: PostRepository,
  pollIntervalMs: number
): Scheduler {
  let timer: ReturnType<typeof setInterval> | null = null;
  let running = false;

  return {
    start(onDuePost) {
      if (timer) {
        return;
      }

      timer = setInterval(() => {
        if (running) {
          return;
        }

        running = true;
        postRepository
          .findDuePosts(new Date())
          .then((posts) => {
            for (const post of posts) {
              void Promise.resolve(onDuePost(post.id)).catch((err) => {
                logError("Scheduled publish failed", {
                  scheduledPostId: post.id,
                  error: err instanceof Error ? err.message : String(err),
                });
              });
            }
          })
          .catch((err) => {
            logError("Scheduler poll failed", {
              error: err instanceof Error ? err.message : String(err),
            });
          })
          .finally(() => {
            running = false;
          });
      }, pollIntervalMs);
    },

    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
  };
}

export function createDaemon(deps: DaemonDeps): Daemon {
  const publisher = createPublisher(deps);
  const pollIntervalMs = deps.pollIntervalMs ?? 30_000;
  const recoveryIntervalMs =
    deps.recoveryIntervalMs ?? QUEUED_RECOVERY_INTERVAL_MS;

  const recovery = createRecovery({
    postRepository: deps.postRepository,
    onRecovered: (postId) => publisher.publishPost(postId),
  });

  const scheduler = createIntervalScheduler(
    deps.postRepository,
    pollIntervalMs
  );

  let recoveryTimer: ReturnType<typeof setInterval> | null = null;

  return {
    scheduler,
    publishPost: (postId) => publisher.publishPost(postId),
    recoverStaleQueued: () => recovery.recoverStaleQueued(),

    async start() {
      scheduler.start((postId) => publisher.publishPost(postId));

      await recovery.recoverStaleQueued().catch((err) => {
        logError("Initial QUEUED recovery failed", {
          error: err instanceof Error ? err.message : String(err),
        });
      });

      recoveryTimer = startRecoveryInterval(
        () => recovery.recoverStaleQueued(),
        recoveryIntervalMs
      );

      logInfo("PostWave daemon started", {
        pollIntervalMs,
        recoveryIntervalMs,
      });
    },

    stop() {
      scheduler.stop();
      if (recoveryTimer) {
        clearInterval(recoveryTimer);
        recoveryTimer = null;
      }
      logInfo("PostWave daemon stopped");
    },
  };
}
