import { beforeEach, describe, expect, it } from "vitest";
import { decrypt, encrypt } from "./encryption";

describe("encryption", () => {
  beforeEach(() => {
    process.env.TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  });

  it("round-trips plaintext", () => {
    const original = "secret-oauth-token-value";
    expect(decrypt(encrypt(original))).toBe(original);
  });

  it("produces different ciphertext each time", () => {
    const a = encrypt("same");
    const b = encrypt("same");
    expect(a).not.toBe(b);
    expect(decrypt(a)).toBe("same");
    expect(decrypt(b)).toBe("same");
  });
});
