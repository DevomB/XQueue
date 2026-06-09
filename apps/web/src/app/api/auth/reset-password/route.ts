import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { apiError, withApiHandler } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? "Invalid input", 400);
    }

    const email = parsed.data.email.toLowerCase();
    const record = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: parsed.data.token,
        },
      },
    });

    if (!record || record.expires < new Date()) {
      return apiError("Invalid or expired reset token", 400);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: parsed.data.token,
        },
      },
    });

    return NextResponse.json({ ok: true });
  });
}
