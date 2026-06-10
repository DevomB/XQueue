import { describe, expect, it } from "vitest";
import { randomBytes } from "crypto";
import { createEncryption } from "./encryption.js";

describe("createEncryption", () => {
  const key = randomBytes(32).toString("base64");
  const encryption = createEncryption({ key });

  it("round-trips plaintext", () => {
    const plaintext = "secret-access-token-value";
    const ciphertext = encryption.encrypt(plaintext);
    expect(ciphertext).not.toBe(plaintext);
    expect(encryption.decrypt(ciphertext)).toBe(plaintext);
  });

  it("accepts a Buffer key", () => {
    const bufferKey = randomBytes(32);
    const bufferEncryption = createEncryption({ key: bufferKey });
    const ciphertext = bufferEncryption.encrypt("hello");
    expect(bufferEncryption.decrypt(ciphertext)).toBe("hello");
  });
});
