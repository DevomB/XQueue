import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { disconnectXAccount } from "@/lib/x/token-store";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { xAccountId } = (await request.json()) as { xAccountId?: string };
  if (!xAccountId) {
    return NextResponse.json({ error: "xAccountId required" }, { status: 400 });
  }

  try {
    await disconnectXAccount(session.user.id, xAccountId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 404 });
  }
}
