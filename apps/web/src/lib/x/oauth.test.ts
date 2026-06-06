import { describe, expect, it } from "vitest";
import { needsTokenRefresh, tokenExpiresAt } from "./oauth";

describe("token refresh helpers", () => {
  it("needsTokenRefresh returns true when token expires within buffer", () => {
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    expect(needsTokenRefresh(expiresAt, 5)).toBe(true);
  });

  it("needsTokenRefresh returns false when token is fresh", () => {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    expect(needsTokenRefresh(expiresAt, 5)).toBe(false);
  });

  it("tokenExpiresAt computes correct expiry", () => {
    const before = Date.now();
    const expires = tokenExpiresAt(7200);
    const after = Date.now();
    expect(expires.getTime()).toBeGreaterThanOrEqual(before + 7200 * 1000 - 100);
    expect(expires.getTime()).toBeLessThanOrEqual(after + 7200 * 1000 + 100);
  });
});
