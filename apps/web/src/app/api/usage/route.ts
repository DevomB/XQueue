import { NextResponse } from "next/server";
import { PLAN_LIMITS } from "@xqueue/shared";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUsageCounter } from "@/lib/usage";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });
  const usage = await getUsageCounter(session.user.id);
  const limits = PLAN_LIMITS[user.plan];

  const used = usage.postsScheduled + usage.postsPublished;

  return NextResponse.json({
    plan: user.plan,
    limits,
    usage: {
      postsUsed: used,
      postsLimit: limits.postsPerMonth,
      linkPostsUsed: usage.linkPostsUsed,
      linkPostsLimit: limits.linkPostsPerMonth,
    },
  });
}
