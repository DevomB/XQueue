import { NextResponse } from "next/server";
import { isLinkPost } from "@postwave/shared";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { enqueuePublishJob } from "@/lib/queue";
import { z } from "zod";

const createPostSchema = z.object({
  text: z.string().trim().min(1).max(280),
  scheduledAt: z.string().datetime().optional(),
  timezone: z.string().optional(),
  mediaUrls: z.array(z.string().url()).max(4).optional(),
  status: z.enum(["DRAFT", "SCHEDULED"]).optional(),
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

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.scheduledPost.findMany({
    where: { userId: session.user.id },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: { xAccounts: { take: 1 } },
  });

  const body = await request.json();

  if (body.posts) {
    return handleBulkCreate(user, body);
  }

  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    );
  }

  const timezone = parsed.data.timezone ?? user.timezone;
  const mediaUrls = parsed.data.mediaUrls ?? [];
  const scheduledAt = parsed.data.scheduledAt
    ? new Date(parsed.data.scheduledAt)
    : undefined;
  const status =
    parsed.data.status ??
    (scheduledAt ? "SCHEDULED" : "DRAFT");

  if (status === "SCHEDULED" && !scheduledAt) {
    return NextResponse.json(
      { error: "scheduledAt required for scheduled posts" },
      { status: 400 }
    );
  }

  if (status === "SCHEDULED" && scheduledAt! <= new Date()) {
    return NextResponse.json(
      { error: "Scheduled time must be in the future" },
      { status: 400 }
    );
  }

  if (status === "SCHEDULED" && user.xAccounts.length === 0) {
    return NextResponse.json(
      { error: "Connect an X account before scheduling posts" },
      { status: 400 }
    );
  }

  const post = await prisma.scheduledPost.create({
    data: {
      userId: user.id,
      xAccountId: user.xAccounts[0]?.id,
      text: parsed.data.text,
      scheduledAt,
      timezone,
      status,
      mediaUrls,
      isLinkPost: isLinkPost(parsed.data.text),
    },
  });

  if (status === "SCHEDULED" && scheduledAt) {
    const jobId = await enqueuePublishJob(post.id, scheduledAt);
    await prisma.scheduledPost.update({
      where: { id: post.id },
      data: { bullJobId: jobId },
    });
  }

  return NextResponse.json({ post }, { status: 201 });
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
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    );
  }

  const timezone = parsed.data.timezone ?? user.timezone;
  const scheduled = parsed.data.posts.filter(
    (p) => !p.isDraft && p.scheduledAt
  );

  if (scheduled.length > 0 && user.xAccounts.length === 0) {
    return NextResponse.json(
      { error: "Connect an X account before scheduling posts" },
      { status: 400 }
    );
  }

  for (const item of scheduled) {
    const scheduledAt = new Date(item.scheduledAt!);
    if (scheduledAt <= new Date()) {
      return NextResponse.json(
        { error: "Scheduled time must be in the future" },
        { status: 400 }
      );
    }
  }

  const created = [];
  for (const item of parsed.data.posts) {
    const scheduledAt = item.scheduledAt
      ? new Date(item.scheduledAt)
      : undefined;
    const status =
      item.isDraft || !scheduledAt ? "DRAFT" : "SCHEDULED";

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
      const jobId = await enqueuePublishJob(post.id, scheduledAt);
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { bullJobId: jobId },
      });
    }

    created.push(post);
  }

  return NextResponse.json({ posts: created }, { status: 201 });
}
