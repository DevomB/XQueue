import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!/^[a-f0-9]+\.(jpg|jpeg|png|webp)$/.test(filename)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
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
