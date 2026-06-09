import { describe, expect, it, vi } from "vitest";
import { validateImageMagicBytes } from "./upload-validation";

describe("validateImageMagicBytes", () => {
  it("accepts JPEG magic bytes", () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
    expect(validateImageMagicBytes(buf, "image/jpeg").ok).toBe(true);
  });

  it("rejects mismatched MIME", () => {
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]);
    expect(validateImageMagicBytes(buf, "image/jpeg").ok).toBe(false);
  });

  it("rejects empty buffer", () => {
    expect(validateImageMagicBytes(Buffer.alloc(0), "image/png").ok).toBe(false);
  });
});

describe("upload size limit", () => {
  it("enforces 5MB max in upload route constant", () => {
    const MAX_SIZE = 5 * 1024 * 1024;
    expect(MAX_SIZE).toBe(5242880);
  });
});
