const JPEG = [0xff, 0xd8, 0xff];
const PNG = [0x89, 0x50, 0x4e, 0x47];
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP_MAGIC = [0x57, 0x45, 0x42, 0x50];

function startsWith(buf: Buffer, bytes: number[]): boolean {
  if (buf.length < bytes.length) return false;
  return bytes.every((b, i) => buf[i] === b);
}

export function validateImageMagicBytes(
  buffer: Buffer,
  mimeType: string
): { ok: true } | { ok: false; error: string } {
  if (mimeType === "image/jpeg" && !startsWith(buffer, JPEG)) {
    return { ok: false, error: "File content does not match JPEG format" };
  }
  if (mimeType === "image/png" && !startsWith(buffer, PNG)) {
    return { ok: false, error: "File content does not match PNG format" };
  }
  if (mimeType === "image/webp") {
    const isWebp =
      startsWith(buffer, WEBP_RIFF) &&
      buffer.length >= 12 &&
      startsWith(buffer.subarray(8, 12), WEBP_MAGIC);
    if (!isWebp) {
      return { ok: false, error: "File content does not match WebP format" };
    }
  }
  return { ok: true };
}
