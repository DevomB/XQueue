import {
  MAX_PUBLISH_ATTEMPTS,
  QUEUED_STALE_THRESHOLD_MS,
} from "@postwave/shared";
import { prisma } from "./lib/db.js";
import { decrypt, encrypt } from "./lib/encryption.js";
import { sendFailedPostEmail } from "./lib/email.js";
import { logError, logInfo, logWarn } from "./lib/logger.js";
import {
  createTweet,
  isRetryableStatus,
  needsTokenRefresh,
  refreshAccessToken,
  tokenExpiresAt,
  uploadMediaFromUrl,
} from "./lib/x.js";

async function getValidAccessToken(xAccountId: string): Promise<string> {
  const account = await prisma.xAccount.findUniqueOrThrow({
    where: { id: xAccountId },
  });

  let accessToken = decrypt(account.accessTokenEnc);
  let refreshToken = decrypt(account.refreshTokenEnc);

  if (needsTokenRefresh(account.tokenExpiresAt)) {
    const tokens = await refreshAccessToken(refreshToken);
    accessToken = tokens.access_token;
    if (tokens.refresh_token) {
      refreshToken = tokens.refresh_token;
    }

    await prisma.xAccount.update({
      where: { id: xAccountId },
      data: {
        accessTokenEnc: encrypt(accessToken),
        refreshTokenEnc: encrypt(refreshToken),
        tokenExpiresAt: tokenExpiresAt(tokens.expires_in),
        scopes: tokens.scope ?? account.scopes,
      },
    });
  }

  return accessToken;
}

function isStaleQueued(updatedAt: Date): boolean {
  return Date.now() - updatedAt.getTime() > QUEUED_STALE_THRESHOLD_MS;
}

export async function processPublishJob(scheduledPostId: string): Promise<void> {
  logInfo("Processing publish job", { scheduledPostId });

  const locked = await prisma.$transaction(async (tx) => {
    const post = await tx.scheduledPost.findUnique({
      where: { id: scheduledPostId },
      include: {
        user: true,
        xAccount: true,
      },
    });

    if (!post) return null;
    if (post.status === "PUBLISHED" || post.status === "CANCELLED") {
      return null;
    }
    if (post.status === "QUEUED") {
      if (!isStaleQueued(post.updatedAt)) {
        logInfo("Post already QUEUED, skipping", {
          scheduledPostId,
          status: post.status,
        });
        return null;
      }
      logWarn("Stale QUEUED post, re-attempting", {
        scheduledPostId,
        updatedAt: post.updatedAt.toISOString(),
      });
    }

    await tx.scheduledPost.update({
      where: { id: scheduledPostId },
      data: { status: "QUEUED", attemptCount: { increment: 1 } },
    });

    return post;
  });

  if (!locked) return;

  if (!locked.xAccountId || !locked.xAccount) {
    await markFailed(
      scheduledPostId,
      locked.user.email,
      locked.text,
      "No X account connected"
    );
    return;
  }

  try {
    await publishWithToken(scheduledPostId, locked.xAccountId, locked);
    logInfo("Post published successfully", { scheduledPostId });
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    const message = err instanceof Error ? err.message : "Unknown error";
    logError("Publish failed", {
      scheduledPostId,
      httpStatus: status,
      error: message,
    });

    const post = await prisma.scheduledPost.findUniqueOrThrow({
      where: { id: scheduledPostId },
      include: { user: true },
    });

    if (status === 401 && locked.xAccountId) {
      try {
        await getValidAccessToken(locked.xAccountId);
        await publishWithToken(scheduledPostId, locked.xAccountId, locked);
        logInfo("Post published after token refresh", { scheduledPostId });
        return;
      } catch (retryErr) {
        const retryMessage =
          retryErr instanceof Error ? retryErr.message : "Token refresh failed";
        await markFailed(
          scheduledPostId,
          post.user.email,
          post.text,
          retryMessage
        );
        return;
      }
    }

    if (
      isRetryableStatus(status ?? 0) &&
      post.attemptCount < MAX_PUBLISH_ATTEMPTS
    ) {
      await prisma.scheduledPost.update({
        where: { id: scheduledPostId },
        data: { status: "SCHEDULED" },
      });
      throw err;
    }

    await markFailed(scheduledPostId, post.user.email, post.text, message);
  }
}

async function publishWithToken(
  scheduledPostId: string,
  xAccountId: string,
  locked: {
    text: string;
    mediaUrls: string[];
  }
) {
  try {
    const accessToken = await getValidAccessToken(xAccountId);

    let mediaIds: string[] | undefined;
    if (locked.mediaUrls.length > 0) {
      mediaIds = [];
      for (const url of locked.mediaUrls) {
        const mediaId = await uploadMediaFromUrl(accessToken, url);
        mediaIds.push(mediaId);
      }
    }

    const result = await createTweet(accessToken, locked.text, mediaIds);

    await prisma.scheduledPost.update({
      where: { id: scheduledPostId },
      data: {
        status: "PUBLISHED",
        xTweetId: result.data.id,
        publishedAt: new Date(),
        failureReason: null,
      },
    });
  } catch (err) {
    const current = await prisma.scheduledPost.findUnique({
      where: { id: scheduledPostId },
    });
    if (current?.status === "QUEUED") {
      throw err;
    }
    throw err;
  }
}

async function markFailed(
  postId: string,
  email: string,
  text: string,
  reason: string
) {
  await prisma.scheduledPost.update({
    where: { id: postId },
    data: { status: "FAILED", failureReason: reason },
  });

  logError("Post marked FAILED", { scheduledPostId: postId, reason });

  await sendFailedPostEmail({
    to: email,
    postText: text,
    reason,
    postId,
  });
}

export async function markFailedFromDlq(
  scheduledPostId: string,
  reason: string
): Promise<void> {
  const post = await prisma.scheduledPost.findUnique({
    where: { id: scheduledPostId },
    include: { user: true },
  });
  if (!post || post.status === "PUBLISHED" || post.status === "CANCELLED") {
    return;
  }
  await markFailed(scheduledPostId, post.user.email, post.text, reason);
}
