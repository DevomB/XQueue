import Redis from "ioredis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (process.env.RATE_LIMIT_ENABLED !== "true") return null;
  if (!redis) {
    const url = process.env.REDIS_URL ?? "redis://localhost:6379";
    redis = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
  }
  return redis;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getRedis();
  if (!client) return { ok: true };

  try {
    if (client.status !== "ready") {
      await client.connect().catch(() => null);
    }
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, windowSeconds);
    }
    if (count > limit) {
      return { ok: false, error: "Too many requests. Try again later." };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

export async function rateLimitRequest(
  prefix: string,
  identifier: string,
  limit = 30,
  windowSeconds = 60
) {
  return checkRateLimit(`rl:${prefix}:${identifier}`, limit, windowSeconds);
}
