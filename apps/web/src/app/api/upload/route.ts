import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiError, withApiHandler } from "@/lib/api-utils";
import { prisma } from "@/lib/db";
import { storeUploadedImage } from "@/lib/storage";
import { validateImageMagicBytes } from "@/lib/upload-validation";
import { rateLimitRequest } from "@/lib/rate-limit";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
    });

    const limited = await rateLimitRequest("upload", session.user.id, 20, 3600);
    if (!limited.ok) {
      return apiError(limited.error, 429);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return apiError("No file provided", 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError("Only JPEG, PNG, and WebP images are allowed", 400);
    }

    if (file.size > MAX_SIZE) {
      return apiError("File must be under 5MB", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const magicCheck = validateImageMagicBytes(buffer, file.type);
    if (!magicCheck.ok) {
      return apiError(magicCheck.error, 400);
    }

    const url = await storeUploadedImage(buffer, file.type);

    return NextResponse.json({ url });
  });
}
