export function validateEnv(): void {
  const required = ["DATABASE_URL", "REDIS_URL", "AUTH_SECRET", "TOKEN_ENCRYPTION_KEY"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const key = process.env.TOKEN_ENCRYPTION_KEY!;
  try {
    const decoded = Buffer.from(key, "base64");
    if (decoded.length !== 32) {
      throw new Error("TOKEN_ENCRYPTION_KEY must decode to 32 bytes (base64)");
    }
  } catch {
    throw new Error("TOKEN_ENCRYPTION_KEY must be valid base64 encoding 32 bytes");
  }

  if ((process.env.AUTH_SECRET?.length ?? 0) < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }
}
