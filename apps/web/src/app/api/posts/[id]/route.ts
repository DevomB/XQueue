import { NextResponse } from "next/server";
import { isLinkPost } from "@postwave/shared";
import { auth } from "@/lib/auth";
import { apiError, withApiHandler } from "@/lib/api-utils";
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
  return withApiHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const { id } = await params;
    const post = await prisma.scheduledPost.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!post) {
      return apiError("Not found", 404);
    }

    if (["PUBLISHED", "QUEUED"].includes(post.status)) {
      return apiError(
        "Cannot edit a post that is publishing or published",
        400
      );
    }

    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid input", 400);
    }

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
        return apiError("scheduledAt required for scheduled posts", 400);
      }
      if (scheduledAt <= new Date()) {
        return apiError("Scheduled time must be in the future", 400);
      }

      const xAccounts = await prisma.xAccount.findMany({
        where: { userId: session.user.id },
        take: 1,
      });
      if (xAccounts.length === 0) {
        return apiError("Connect an X account before scheduling posts", 400);
      }
    }

    const previousStatus = post.status;
    const previousScheduledAt = post.scheduledAt;
    const previousBullJobId = post.bullJobId;

    await removePublishJob(post.bullJobId);

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
      try {
        const jobId = await enqueuePublishJob(id, scheduledAt);
        await prisma.scheduledPost.update({
          where: { id },
          data: { bullJobId: jobId },
        });
      } catch {
        await prisma.scheduledPost.update({
          where: { id },
          data: {
            status: previousStatus,
            scheduledAt: previousScheduledAt,
            bullJobId: previousBullJobId,
          },
        });
        return apiError(
          "Queue unavailable; schedule change rolled back. Try again.",
          503
        );
      }
    }

    const final = await prisma.scheduledPost.findUniqueOrThrow({
      where: { id },
    });

    return NextResponse.json({ post: final });
  });
}

export async function DELETE(
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
    });

    if (!post) {
      return apiError("Not found", 404);
    }

    if (post.status === "QUEUED") {
      return apiError("Cannot delete while publishing", 400);
    }

    await removePublishJob(post.bullJobId);
    await prisma.scheduledPost.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  });
}
