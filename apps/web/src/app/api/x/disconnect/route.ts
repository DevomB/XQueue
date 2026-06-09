import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiError, withApiHandler } from "@/lib/api-utils";
import { disconnectXAccount } from "@/lib/x/token-store";

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const { xAccountId } = (await request.json()) as { xAccountId?: string };
    if (!xAccountId) {
      return apiError("xAccountId required", 400);
    }

    try {
      await disconnectXAccount(session.user.id, xAccountId);
      return NextResponse.json({ ok: true });
    } catch {
      return apiError("Failed to disconnect", 404);
    }
  });
}
