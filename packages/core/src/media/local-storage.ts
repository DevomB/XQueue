import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import type { MediaStorage } from "../ports.js";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGES_PER_POST = 4;

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
  if (buffer.length === 0) {
    return { ok: false, error: "Empty file" };
  }
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

export type LocalMediaStorageOptions = {
  mediaDir: string;
};

export function createLocalMediaStorage(
  options: LocalMediaStorageOptions
): MediaStorage {
  const mediaDir = path.resolve(options.mediaDir);

  async function ensureDir(): Promise<void> {
    await mkdir(mediaDir, { recursive: true });
  }

  function resolvePath(relativePath: string): string {
    const resolved = path.resolve(mediaDir, relativePath);
    if (!resolved.startsWith(mediaDir + path.sep) && resolved !== mediaDir) {
      throw new Error("Invalid media path");
    }
    return resolved;
  }

  return {
    async saveMedia(buffer: Buffer, mimeType: string): Promise<string> {
      if (!ALLOWED_TYPES.has(mimeType)) {
        throw new Error("Only JPEG, PNG, and WebP images are allowed");
      }
      if (buffer.length > MAX_SIZE_BYTES) {
        throw new Error("File must be under 5MB");
      }

      const magic = validateImageMagicBytes(buffer, mimeType);
      if (!magic.ok) {
        throw new Error(magic.error);
      }

      await ensureDir();
      const ext = ALLOWED_EXT[mimeType] ?? "jpg";
      const filename = `${randomBytes(16).toString("hex")}.${ext}`;
      await writeFile(path.join(mediaDir, filename), buffer);
      return filename;
    },

    async readMedia(relativePath: string) {
      const filePath = resolvePath(relativePath);
      const buffer = await readFile(filePath);
      const ext = path.extname(relativePath).toLowerCase();
      const mimeType =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
            ? "image/webp"
            : "image/jpeg";
      return { buffer, mimeType };
    },

    async deleteMedia(relativePath: string): Promise<void> {
      const filePath = resolvePath(relativePath);
      await unlink(filePath).catch(() => null);
    },
  };
}

export function assertMediaCount(count: number): void {
  if (count > MAX_IMAGES_PER_POST) {
    throw new Error(`A post may include at most ${MAX_IMAGES_PER_POST} images`);
  }
}
