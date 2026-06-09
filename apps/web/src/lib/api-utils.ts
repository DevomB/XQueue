import { NextResponse } from "next/server";

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function withApiHandler<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  try {
    return await handler();
  } catch (err) {
    console.error("API error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return apiError(message, 500);
  }
}
