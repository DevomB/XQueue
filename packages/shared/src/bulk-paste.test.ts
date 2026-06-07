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

  it("rejects past scheduled times", () => {
    const result = parseBulkPaste(
      "2020-01-01 09:00 | Old post",
      "UTC"
    );
    expect(result[0].error).toMatch(/future/i);
  });

  it("rejects text over 280 characters", () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    const date = future.toISOString().slice(0, 10);
    const longText = "x".repeat(281);
    const result = parseBulkPaste(`${date} 12:00 | ${longText}`, "UTC");
    expect(result[0].error).toMatch(/280/);
  });

  it("flags invalid datetime format", () => {
    const result = parseBulkPaste("2026-13-40 25:99 | Hello", "UTC");
    expect(result[0].error).toMatch(/Invalid date/i);
  });

  it("parses multiple lines", () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    const date = future.toISOString().slice(0, 10);
    const result = parseBulkPaste(
      `${date} 09:00 | First\nDraft line\n${date} 18:00 | Second`,
      "UTC"
    );
    expect(result).toHaveLength(3);
    expect(result.filter((l) => l.isDraft)).toHaveLength(1);
  });
});
