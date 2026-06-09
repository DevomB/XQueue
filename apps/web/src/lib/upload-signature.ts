import { createHmac, timingSafeEqual } from "crypto";

const UPLOAD_URL_TTL_MS = 60 * 60 * 1000;

function getSigningKey(): string {
  return process.env.TOKEN_ENCRYPTION_KEY ?? process.env.AUTH_SECRET ?? "dev-key";
}

export function signUploadFilename(filename: string): string {
  const expires = Date.now() + UPLOAD_URL_TTL_MS;
  const payload = `${filename}:${expires}`;
  const sig = createHmac("sha256", getSigningKey())
    .update(payload)
    .digest("base64url");
  return `${expires}.${sig}`;
}

export function verifyUploadSignature(
  filename: string,
  token: string | null
): boolean {
  if (!token) return false;
  const [expiresStr, sig] = token.split(".");
  if (!expiresStr || !sig) return false;

  const expires = Number(expiresStr);
  if (Number.isNaN(expires) || expires < Date.now()) return false;

  const expected = createHmac("sha256", getSigningKey())
    .update(`${filename}:${expires}`)
    .digest("base64url");

  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function buildSignedUploadUrl(filename: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const sig = signUploadFilename(filename);
  return `${appUrl}/api/uploads/${filename}?sig=${sig}`;
}
