import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { enqueuePublishJob } from "@/lib/queue";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.scheduledPost.findFirst({
    where: { id, userId: session.user.id },
    include: { user: { include: { xAccounts: { take: 1 } } } },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.status !== "FAILED") {
    return NextResponse.json(
      { error: "Only failed posts can be retried" },
      { status: 400 }
    );
  }

  if (post.user.xAccounts.length === 0) {
    return NextResponse.json(
      { error: "Connect an X account first" },
      { status: 400 }
    );
  }

  const scheduledAt = new Date(Date.now() + 60_000);

  const updated = await prisma.scheduledPost.update({
    where: { id },
    data: {
      status: "SCHEDULED",
      scheduledAt,
      attemptCount: 0,
      failureReason: null,
      xAccountId: post.user.xAccounts[0].id,
    },
  });

  const jobId = await enqueuePublishJob(id, scheduledAt);
  await prisma.scheduledPost.update({
    where: { id },
    data: { bullJobId: jobId },
  });

  return NextResponse.json({ post: updated });
}
