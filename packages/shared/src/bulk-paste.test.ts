import { describe, expect, it } from "vitest";
import { parseBulkPaste } from "./bulk-paste.js";

describe("parseBulkPaste", () => {
  it("parses scheduled lines", () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    const date = future.toISOString().slice(0, 10);
    const result = parseBulkPaste(
      `${date} 14:00 | Hello world`,
      "America/New_York"
    );
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Hello world");
    expect(result[0].isDraft).toBe(false);
    expect(result[0].scheduledAt).toBeInstanceOf(Date);
  });

  it("parses draft lines without datetime", () => {
    const result = parseBulkPaste("Just a draft post", "UTC");
    expect(result).toHaveLength(1);
    expect(result[0].isDraft).toBe(true);
    expect(result[0].scheduledAt).toBeUndefined();
  });

  it("skips empty lines", () => {
    const result = parseBulkPaste("\n\n  \n", "UTC");
    expect(result).toHaveLength(0);
  });
});
