import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { apiError, withApiHandler } from "@/lib/api-utils";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimitRequest } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const limited = await rateLimitRequest("forgot-password", ip, 5, 3600);
    if (!limited.ok) return apiError(limited.error, 429);

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid email", 400);
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });
      await prisma.verificationToken.create({
        data: { identifier: email, token, expires },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      await sendPasswordResetEmail({
        to: email,
        resetUrl: `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`,
      });
    }

    return NextResponse.json({
      ok: true,
      message: "If an account exists, a reset link has been sent.",
    });
  });
}
