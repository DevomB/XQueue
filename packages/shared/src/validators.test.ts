import { describe, expect, it } from "vitest";
import { postTextSchema, timezoneSchema } from "./validators.js";

describe("validators", () => {
  it("accepts valid post text", () => {
    expect(postTextSchema.safeParse("Hello").success).toBe(true);
  });

  it("rejects empty post text", () => {
    expect(postTextSchema.safeParse("   ").success).toBe(false);
  });

  it("rejects post text over 280 chars", () => {
    expect(postTextSchema.safeParse("x".repeat(281)).success).toBe(false);
  });

  it("accepts valid IANA timezone", () => {
    expect(timezoneSchema.safeParse("America/New_York").success).toBe(true);
  });

  it("rejects invalid timezone", () => {
    expect(timezoneSchema.safeParse("Not/A/Timezone").success).toBe(false);
  });
});
