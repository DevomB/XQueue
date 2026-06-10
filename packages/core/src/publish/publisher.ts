import {
  MAX_PUBLISH_ATTEMPTS,
  QUEUED_STALE_THRESHOLD_MS,
} from "@postwave/shared";
import type { MediaStorage, PostRepository } from "../ports.js";
import type { TokenService } from "../x/token-service.js";
import {
  createTweet,
  isRetryableStatus,
  uploadMediaFromBuffer,
  uploadMediaFromUrl,
} from "../x/client.js";
import type { EmailNotifier } from "../notify/email.js";
import { logError, logInfo, logWarn } from "../logger.js";

export type PublisherDeps = {
  postRepository: PostRepository;
  tokenService: TokenService;
  mediaStorage?: MediaStorage;
  emailNotifier?: EmailNotifier;
  notifyEmail?: string;
};

function isStaleQueued(updatedAt: Date): boolean {
  return Date.now() - updatedAt.getTime() > QUEUED_STALE_THRESHOLD_MS;
}

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function createPublisher(deps: PublisherDeps) {
  async function markFailed(
    postId: string,
    text: string,
    reason: string
  ): Promise<void> {
    await deps.postRepository.markFailed(postId, reason);
    logError("Post marked FAILED", { scheduledPostId: postId, reason });

    if (deps.notifyEmail && deps.emailNotifier) {
      await deps.emailNotifier.sendFailedPostEmail({
        to: deps.notifyEmail,
        postText: text,
        reason,
        postId,
      });
    }
  }

  async function uploadPostMedia(
    accessToken: string,
    mediaPaths: string[]
  ): Promise<string[] | undefined> {
    if (mediaPaths.length === 0) {
      return undefined;
    }

    const mediaIds: string[] = [];
    for (const mediaPath of mediaPaths) {
      if (isHttpUrl(mediaPath)) {
        mediaIds.push(await uploadMediaFromUrl(accessToken, mediaPath));
        continue;
      }

      if (!deps.mediaStorage) {
        throw new Error("Local media path requires MediaStorage");
      }

      const { buffer, mimeType } = await deps.mediaStorage.readMedia(mediaPath);
      mediaIds.push(
        await uploadMediaFromBuffer(accessToken, buffer, mimeType)
      );
    }

    return mediaIds;
  }

  async function publishWithToken(
    scheduledPostId: string,
    post: { text: string; mediaPaths: string[] }
  ): Promise<void> {
    const accessToken = await deps.tokenService.getValidAccessToken();
    const mediaIds = await uploadPostMedia(accessToken, post.mediaPaths);
    const result = await createTweet(accessToken, post.text, mediaIds);
    await deps.postRepository.markPublished(scheduledPostId, result.data.id);
  }

  return {
    async publishPost(scheduledPostId: string): Promise<void> {
      logInfo("Processing publish job", { scheduledPostId });

      const locked = await deps.postRepository.lockForPublish(scheduledPostId);
      if (!locked) {
        return;
      }

      if (
        locked.status === "QUEUED" &&
        isStaleQueued(locked.updatedAt)
      ) {
        logWarn("Stale QUEUED post, re-attempting", {
          scheduledPostId,
          updatedAt: locked.updatedAt.toISOString(),
        });
      }

      try {
        await publishWithToken(scheduledPostId, locked);
        logInfo("Post published successfully", { scheduledPostId });
      } catch (err) {
        const status = (err as Error & { status?: number }).status;
        const message = err instanceof Error ? err.message : "Unknown error";
        logError("Publish failed", {
          scheduledPostId,
          httpStatus: status,
          error: message,
        });

        const post = await deps.postRepository.findById(scheduledPostId);
        if (!post) {
          return;
        }

        if (status === 401) {
          try {
            await deps.tokenService.getValidAccessToken();
            await publishWithToken(scheduledPostId, locked);
            logInfo("Post published after token refresh", { scheduledPostId });
            return;
          } catch (retryErr) {
            const retryMessage =
              retryErr instanceof Error
                ? retryErr.message
                : "Token refresh failed";
            await markFailed(scheduledPostId, post.text, retryMessage);
            return;
          }
        }

        if (
          isRetryableStatus(status ?? 0) &&
          post.attemptCount < MAX_PUBLISH_ATTEMPTS
        ) {
          await deps.postRepository.markScheduled(scheduledPostId);
          throw err;
        }

        await markFailed(scheduledPostId, post.text, message);
      }
    },

    async markFailedFromDlq(
      scheduledPostId: string,
      reason: string
    ): Promise<void> {
      const post = await deps.postRepository.findById(scheduledPostId);
      if (!post || post.status === "PUBLISHED" || post.status === "CANCELLED") {
        return;
      }
      await markFailed(scheduledPostId, post.text, reason);
    },
  };
}
