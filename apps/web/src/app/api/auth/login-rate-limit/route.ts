import { NextResponse } from "next/server";
import { apiError, withApiHandler } from "@/lib/api-utils";
import { rateLimitRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const limited = await rateLimitRequest("login", ip, 10, 900);
    if (!limited.ok) return apiError(limited.error, 429);
    return NextResponse.json({ ok: true });
  });
}
