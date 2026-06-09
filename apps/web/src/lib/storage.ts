import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { buildSignedUploadUrl } from "./upload-signature";

const ALLOWED_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function storeUploadedImage(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const storageType = process.env.STORAGE_TYPE ?? "local";
  const ext = ALLOWED_EXT[mimeType] ?? "jpg";
  const filename = `${randomBytes(16).toString("hex")}.${ext}`;

  if (storageType === "s3") {
    return storeS3(buffer, filename, mimeType);
  }

  return storeLocal(buffer, filename);
}

async function storeLocal(buffer: Buffer, filename: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return buildSignedUploadUrl(filename);
}

async function storeS3(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION ?? "us-east-1";
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const publicUrl = process.env.S3_PUBLIC_URL;

  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("S3 storage is not configured");
  }

  const key = `uploads/${filename}`;
  const endpoint = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  const { createHash, createHmac } = await import("crypto");
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = createHash("sha256").update(buffer).digest("hex");

  const canonicalHeaders = `host:${bucket}.s3.${region}.amazonaws.com\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "PUT",
    `/${key}`,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");

  const kDate = createHmac("sha256", `AWS4${secretAccessKey}`)
    .update(dateStamp)
    .digest();
  const kRegion = createHmac("sha256", kDate).update(region).digest();
  const kService = createHmac("sha256", kRegion).update("s3").digest();
  const kSigning = createHmac("sha256", kService)
    .update("aws4_request")
    .digest();
  const signature = createHmac("sha256", kSigning)
    .update(stringToSign)
    .digest("hex");

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(endpoint, {
    method: "PUT",
    headers: {
      Authorization: authorization,
      "Content-Type": mimeType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    throw new Error(`S3 upload failed: ${res.status}`);
  }

  if (publicUrl) {
    return `${publicUrl.replace(/\/$/, "")}/${key}`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
