import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { timezoneSchema } from "@xqueue/shared";

const updateSchema = z.object({
  timezone: timezoneSchema.optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: { xAccounts: true },
  });

  return NextResponse.json({
    timezone: user.timezone,
    plan: user.plan,
    xAccounts: user.xAccounts.map((a) => ({
      id: a.id,
      username: a.xUsername,
      connectedAt: a.connectedAt,
    })),
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  return NextResponse.json({ timezone: user.timezone });
}
