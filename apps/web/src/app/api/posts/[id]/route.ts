import { NextResponse } from "next/server";
import { isLinkPost } from "@postwave/shared";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { enqueuePublishJob, removePublishJob } from "@/lib/queue";
import { z } from "zod";

const updateSchema = z.object({
  text: z.string().trim().min(1).max(280).optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "CANCELLED"]).optional(),
  mediaUrls: z.array(z.string().url()).max(4).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.scheduledPost.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (["PUBLISHED", "QUEUED"].includes(post.status)) {
    return NextResponse.json(
      { error: "Cannot edit a post that is publishing or published" },
      { status: 400 }
    );
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    );
  }

  await removePublishJob(post.bullJobId);

  const scheduledAt =
    parsed.data.scheduledAt === null
      ? null
      : parsed.data.scheduledAt
        ? new Date(parsed.data.scheduledAt)
        : post.scheduledAt;

  const text = parsed.data.text ?? post.text;
  const status = parsed.data.status ?? post.status;
  const mediaUrls = parsed.data.mediaUrls ?? post.mediaUrls;

  if (status === "SCHEDULED") {
    if (!scheduledAt) {
      return NextResponse.json(
        { error: "scheduledAt required for scheduled posts" },
        { status: 400 }
      );
    }
    if (scheduledAt <= new Date()) {
      return NextResponse.json(
        { error: "Scheduled time must be in the future" },
        { status: 400 }
      );
    }

    const xAccounts = await prisma.xAccount.findMany({
      where: { userId: session.user.id },
      take: 1,
    });
    if (xAccounts.length === 0) {
      return NextResponse.json(
        { error: "Connect an X account before scheduling posts" },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.scheduledPost.update({
    where: { id },
    data: {
      text,
      scheduledAt,
      status,
      mediaUrls,
      isLinkPost: isLinkPost(text),
      bullJobId: null,
      failureReason: status === "CANCELLED" ? null : post.failureReason,
      ...(status === "SCHEDULED"
        ? {
            xAccountId: (
              await prisma.xAccount.findFirst({
                where: { userId: session.user.id },
              })
            )?.id,
          }
        : {}),
    },
  });

  if (status === "SCHEDULED" && scheduledAt && scheduledAt > new Date()) {
    const jobId = await enqueuePublishJob(id, scheduledAt);
    await prisma.scheduledPost.update({
      where: { id },
      data: { bullJobId: jobId },
    });
  }

  return NextResponse.json({ post: updated });
}

export async function DELETE(
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
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.status === "QUEUED") {
    return NextResponse.json(
      { error: "Cannot delete while publishing" },
      { status: 400 }
    );
  }

  await removePublishJob(post.bullJobId);
  await prisma.scheduledPost.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
