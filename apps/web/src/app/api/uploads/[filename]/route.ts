import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { verifyUploadSignature } from "@/lib/upload-signature";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!/^[a-f0-9]+\.(jpg|jpeg|png|webp)$/.test(filename)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  const url = new URL(request.url);
  const sig = url.searchParams.get("sig");
  const session = await auth();

  if (!session?.user?.id && !verifyUploadSignature(filename, sig)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const filePath = path.join(process.cwd(), "uploads", filename);
    const buffer = await readFile(filePath);
    const ext = filename.split(".").pop() ?? "jpg";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
