import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { storeUploadedImage } from "@/lib/storage";
import { validateImageMagicBytes } from "@/lib/upload-validation";
import { rateLimitRequest } from "@/lib/rate-limit";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const limited = await rateLimitRequest("upload", session.user.id, 20, 3600);
  if (!limited.ok) {
    return NextResponse.json({ error: limited.error }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, and WebP images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File must be under 5MB" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const magicCheck = validateImageMagicBytes(buffer, file.type);
  if (!magicCheck.ok) {
    return NextResponse.json({ error: magicCheck.error }, { status: 400 });
  }

  const url = await storeUploadedImage(buffer, file.type);

  return NextResponse.json({ url });
}
