import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiError, withApiHandler } from "@/lib/api-utils";
import { prisma } from "@/lib/db";
import { enqueuePublishJob } from "@/lib/queue";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const { id } = await params;
    const post = await prisma.scheduledPost.findFirst({
      where: { id, userId: session.user.id },
      include: { user: { include: { xAccounts: { take: 1 } } } },
    });

    if (!post) {
      return apiError("Not found", 404);
    }

    if (post.status !== "FAILED") {
      return apiError("Only failed posts can be retried", 400);
    }

    if (post.user.xAccounts.length === 0) {
      return apiError("Connect an X account first", 400);
    }

    const scheduledAt = new Date(Date.now() + 60_000);

    await prisma.scheduledPost.update({
      where: { id },
      data: {
        status: "SCHEDULED",
        scheduledAt,
        attemptCount: 0,
        failureReason: null,
        xAccountId: post.user.xAccounts[0].id,
        bullJobId: null,
      },
    });

    try {
      const jobId = await enqueuePublishJob(id, scheduledAt);
      await prisma.scheduledPost.update({
        where: { id },
        data: { bullJobId: jobId },
      });
    } catch {
      await prisma.scheduledPost.update({
        where: { id },
        data: { status: "FAILED", failureReason: "Queue unavailable" },
      });
      return apiError("Queue unavailable; try again later", 503);
    }

    const updated = await prisma.scheduledPost.findUniqueOrThrow({
      where: { id },
    });

    return NextResponse.json({ post: updated });
  });
}
