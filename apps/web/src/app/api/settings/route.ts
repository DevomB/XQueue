import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { apiError, withApiHandler } from "@/lib/api-utils";
import { prisma } from "@/lib/db";
import { timezoneSchema } from "@postwave/shared";

const updateSchema = z.object({
  timezone: timezoneSchema.optional(),
});

export async function GET() {
  return withApiHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      include: { xAccounts: true },
    });

    return NextResponse.json({
      timezone: user.timezone,
      xAccounts: user.xAccounts.map((a) => ({
        id: a.id,
        username: a.xUsername,
        connectedAt: a.connectedAt,
      })),
    });
  });
}

export async function PATCH(request: Request) {
  return withApiHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid input", 400);
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
    });

    return NextResponse.json({ timezone: user.timezone });
  });
}
