import { NextResponse } from "next/server";
import { auth, signOut } from "@/lib/auth";
import { apiError, withApiHandler } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

export async function DELETE() {
  return withApiHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    await prisma.user.delete({ where: { id: session.user.id } });
    await signOut({ redirect: false });

    return NextResponse.json({ ok: true });
  });
}
