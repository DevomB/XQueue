import { PLAN_LIMITS, isLinkPost, type Plan } from "@xqueue/shared";
import { prisma } from "@/lib/db";

export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getUsageCounter(userId: string) {
  const month = currentMonthKey();
  return prisma.usageCounter.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, month },
    update: {},
  });
}

export type UsageCheckResult =
  | { ok: true }
  | { ok: false; reason: string; upgrade?: boolean };

export async function checkCanSchedule(params: {
  userId: string;
  plan: Plan;
  count: number;
  texts: string[];
  hasMedia: boolean;
}): Promise<UsageCheckResult> {
  const limits = PLAN_LIMITS[params.plan];
  const usage = await getUsageCounter(params.userId);

  if (params.hasMedia && !limits.mediaAllowed) {
    return {
      ok: false,
      reason: "Image posts require a Pro subscription.",
      upgrade: true,
    };
  }

  const linkCount = params.texts.filter((t) => isLinkPost(t)).length;
  const regularCount = params.count - linkCount;

  const remainingPosts =
    limits.postsPerMonth - usage.postsScheduled - usage.postsPublished;
  const remainingLinks = limits.linkPostsPerMonth - usage.linkPostsUsed;

  if (regularCount > remainingPosts) {
    return {
      ok: false,
      reason: `Monthly post limit reached (${limits.postsPerMonth}/month on ${params.plan} plan).`,
      upgrade: params.plan === "FREE",
    };
  }

  if (linkCount > 0 && params.plan === "FREE") {
    return {
      ok: false,
      reason: "Posts containing URLs require a Pro subscription.",
      upgrade: true,
    };
  }

  if (linkCount > remainingLinks) {
    return {
      ok: false,
      reason: `Monthly link post limit reached (${limits.linkPostsPerMonth}/month on Pro).`,
      upgrade: false,
    };
  }

  return { ok: true };
}

export async function incrementScheduledUsage(
  userId: string,
  texts: string[]
) {
  const month = currentMonthKey();
  const linkCount = texts.filter((t) => isLinkPost(t)).length;

  await prisma.usageCounter.upsert({
    where: { userId_month: { userId, month } },
    create: {
      userId,
      month,
      postsScheduled: texts.length,
      linkPostsUsed: linkCount,
    },
    update: {
      postsScheduled: { increment: texts.length },
      linkPostsUsed: { increment: linkCount },
    },
  });
}

export async function incrementPublishedUsage(
  userId: string,
  isLink: boolean
) {
  const month = currentMonthKey();
  await prisma.usageCounter.upsert({
    where: { userId_month: { userId, month } },
    create: {
      userId,
      month,
      postsPublished: 1,
      linkPostsUsed: isLink ? 1 : 0,
    },
    update: {
      postsPublished: { increment: 1 },
      ...(isLink ? { linkPostsUsed: { increment: 1 } } : {}),
    },
  });
}
