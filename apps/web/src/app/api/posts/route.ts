import { NextResponse } from "next/server";
import { isLinkPost } from "@postwave/shared";
import { auth } from "@/lib/auth";
import { apiError, withApiHandler } from "@/lib/api-utils";
import { prisma } from "@/lib/db";
import { enqueuePublishJob } from "@/lib/queue";
import { rateLimitRequest } from "@/lib/rate-limit";
import { z } from "zod";

const createPostSchema = z.object({
  text: z.string().trim().min(1).max(280),
  scheduledAt: z.string().datetime().optional(),
  timezone: z.string().optional(),
  mediaUrls: z.array(z.string().url()).max(4).optional(),
  status: z.enum(["DRAFT", "SCHEDULED"]).optional(),
  xAccountId: z.string().optional(),
});

const bulkCreateSchema = z.object({
  posts: z.array(
    z.object({
      text: z.string().trim().min(1).max(280),
      scheduledAt: z.string().datetime().optional(),
      isDraft: z.boolean().optional(),
      mediaUrls: z.array(z.string().url()).max(4).optional(),
    })
  ),
  timezone: z.string().optional(),
});

async function schedulePost(
  postId: string,
  scheduledAt: Date
): Promise<string> {
  try {
    const jobId = await enqueuePublishJob(postId, scheduledAt);
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { bullJobId: jobId },
    });
    return jobId;
  } catch {
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "DRAFT", scheduledAt: null, bullJobId: null },
    });
    throw new Error("Queue unavailable; post saved as draft. Try scheduling again.");
  }
}

export async function GET() {
  return withApiHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const posts = await prisma.scheduledPost.findMany({
      where: { userId: session.user.id },
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ posts });
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const rl = await rateLimitRequest("posts", session.user.id, 60, 3600);
    if (!rl.ok) return apiError(rl.error, 429);

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      include: { xAccounts: true },
    });

    const body = await request.json();

    if (body.posts) {
      return handleBulkCreate(user, body);
    }

    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid input", 400);
    }

    const timezone = parsed.data.timezone ?? user.timezone;
    const mediaUrls = parsed.data.mediaUrls ?? [];
    const scheduledAt = parsed.data.scheduledAt
      ? new Date(parsed.data.scheduledAt)
      : undefined;
    const status =
      parsed.data.status ?? (scheduledAt ? "SCHEDULED" : "DRAFT");

    if (status === "SCHEDULED" && !scheduledAt) {
      return apiError("scheduledAt required for scheduled posts", 400);
    }

    if (status === "SCHEDULED" && scheduledAt! <= new Date()) {
      return apiError("Scheduled time must be in the future", 400);
    }

    if (status === "SCHEDULED" && user.xAccounts.length === 0) {
      return apiError("Connect an X account before scheduling posts", 400);
    }

    const xAccountId =
      parsed.data.xAccountId &&
      user.xAccounts.some((a) => a.id === parsed.data.xAccountId)
        ? parsed.data.xAccountId
        : user.xAccounts[0]?.id;

    const post = await prisma.scheduledPost.create({
      data: {
        userId: user.id,
        xAccountId,
        text: parsed.data.text,
        scheduledAt,
        timezone,
        status,
        mediaUrls,
        isLinkPost: isLinkPost(parsed.data.text),
      },
    });

    if (status === "SCHEDULED" && scheduledAt) {
      try {
        await schedulePost(post.id, scheduledAt);
      } catch (err) {
        return apiError(
          err instanceof Error ? err.message : "Queue unavailable",
          503
        );
      }
    }

    const updated = await prisma.scheduledPost.findUniqueOrThrow({
      where: { id: post.id },
    });

    return NextResponse.json({ post: updated }, { status: 201 });
  });
}

async function handleBulkCreate(
  user: {
    id: string;
    timezone: string;
    xAccounts: { id: string }[];
  },
  body: unknown
) {
  const parsed = bulkCreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? "Invalid input", 400);
  }

  const timezone = parsed.data.timezone ?? user.timezone;
  const scheduled = parsed.data.posts.filter(
    (p) => !p.isDraft && p.scheduledAt
  );

  if (scheduled.length > 0 && user.xAccounts.length === 0) {
    return apiError("Connect an X account before scheduling posts", 400);
  }

  for (const item of scheduled) {
    const scheduledAt = new Date(item.scheduledAt!);
    if (scheduledAt <= new Date()) {
      return apiError("Scheduled time must be in the future", 400);
    }
  }

  const created = [];
  for (const item of parsed.data.posts) {
    const scheduledAt = item.scheduledAt
      ? new Date(item.scheduledAt)
      : undefined;
    const status = item.isDraft || !scheduledAt ? "DRAFT" : "SCHEDULED";

    const post = await prisma.scheduledPost.create({
      data: {
        userId: user.id,
        xAccountId: user.xAccounts[0]?.id,
        text: item.text,
        scheduledAt,
        timezone,
        status,
        mediaUrls: item.mediaUrls ?? [],
        isLinkPost: isLinkPost(item.text),
      },
    });

    if (status === "SCHEDULED" && scheduledAt) {
      try {
        await schedulePost(post.id, scheduledAt);
      } catch (err) {
        return apiError(
          err instanceof Error ? err.message : "Queue unavailable during bulk import",
          503
        );
      }
    }

    const updated = await prisma.scheduledPost.findUniqueOrThrow({
      where: { id: post.id },
    });
    created.push(updated);
  }

  return NextResponse.json({ posts: created }, { status: 201 });
}
