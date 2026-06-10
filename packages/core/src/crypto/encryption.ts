import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

export type EncryptionConfig = {
  key: Buffer | string;
};

function resolveKey(config: EncryptionConfig): Buffer {
  const key =
    typeof config.key === "string"
      ? Buffer.from(config.key, "base64")
      : config.key;

  if (key.length !== 32) {
    throw new Error("Encryption key must be 32 bytes (base64-encoded string or Buffer)");
  }

  return key;
}

export function createEncryption(config: EncryptionConfig) {
  const key = resolveKey(config);

  return {
    encrypt(plaintext: string): string {
      const iv = randomBytes(12);
      const cipher = createCipheriv(ALGORITHM, key, iv);
      const encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
      ]);
      const tag = cipher.getAuthTag();
      return Buffer.concat([iv, tag, encrypted]).toString("base64");
    },

    decrypt(ciphertext: string): string {
      const data = Buffer.from(ciphertext, "base64");
      const iv = data.subarray(0, 12);
      const tag = data.subarray(12, 28);
      const encrypted = data.subarray(28);
      const decipher = createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]).toString("utf8");
    },
  };
}
