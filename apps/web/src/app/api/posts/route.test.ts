import { describe, expect, it } from "vitest";
import { z } from "zod";

const createPostSchema = z.object({
  text: z.string().trim().min(1).max(280),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "SCHEDULED"]).optional(),
  mediaUrls: z.array(z.string().url()).max(4).optional(),
});

describe("POST /api/posts validation", () => {
  it("accepts valid draft", () => {
    const result = createPostSchema.safeParse({
      text: "Hello",
      status: "DRAFT",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty text", () => {
    const result = createPostSchema.safeParse({ text: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects text over 280 chars", () => {
    const result = createPostSchema.safeParse({
      text: "x".repeat(281),
    });
    expect(result.success).toBe(false);
  });

  it("accepts up to 4 media URLs", () => {
    const result = createPostSchema.safeParse({
      text: "With images",
      mediaUrls: [
        "https://example.com/1.jpg",
        "https://example.com/2.jpg",
      ],
    });
    expect(result.success).toBe(true);
  });
});
