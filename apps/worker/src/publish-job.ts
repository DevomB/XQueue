import { MAX_PUBLISH_ATTEMPTS } from "@postwave/shared";
import { prisma } from "./lib/db.js";
import { decrypt, encrypt } from "./lib/encryption.js";
import { sendFailedPostEmail } from "./lib/email.js";
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

export async function processPublishJob(scheduledPostId: string): Promise<void> {
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
      return null;
    }

    await tx.scheduledPost.update({
      where: { id: scheduledPostId },
      data: { status: "QUEUED", attemptCount: { increment: 1 } },
    });

    return post;
  });

  if (!locked) return;

  if (!locked.xAccountId || !locked.xAccount) {
    await markFailed(scheduledPostId, locked.user.email, locked.text, "No X account connected");
    return;
  }

  try {
    await publishWithToken(scheduledPostId, locked.xAccountId, locked);
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    const message = err instanceof Error ? err.message : "Unknown error";
    const post = await prisma.scheduledPost.findUniqueOrThrow({
      where: { id: scheduledPostId },
      include: { user: true },
    });

    if (status === 401 && locked.xAccountId) {
      try {
        await getValidAccessToken(locked.xAccountId);
        await publishWithToken(scheduledPostId, locked.xAccountId, locked);
        return;
      } catch (retryErr) {
        const retryMessage =
          retryErr instanceof Error ? retryErr.message : "Token refresh failed";
        await markFailed(scheduledPostId, post.user.email, post.text, retryMessage);
        return;
      }
    }

    if (isRetryableStatus(status ?? 0) && post.attemptCount < MAX_PUBLISH_ATTEMPTS) {
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

  await sendFailedPostEmail({
    to: email,
    postText: text,
    reason,
    postId,
  });
}
