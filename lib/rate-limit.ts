import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  /** Maximun number of requests allowed within the window */
  limit: number;
  /** Sliding window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

// Memory fallback store for environments without Upstash Redis
const memoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Clean up expired memory entries periodically to prevent memory leaks
 */
function cleanupMemoryStore() {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (record.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Extract client IP or identifier from request headers
 */
export function getClientIdentifier(request: NextRequest, userId?: string | null): string {
  if (userId) return `user:${userId}`;
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") || "127.0.0.1";
  return `ip:${ip}`;
}

/**
 * Rate limits a request using Upstash REST API if configured, otherwise falls back to memory store.
 */
export async function checkRateLimit(
  identifier: string,
  routeKey: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, windowSeconds } = config;
  const key = `ratelimit:${routeKey}:${identifier}`;
  const now = Date.now();

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. Upstash Redis REST API (if env variables available)
  if (upstashUrl && upstashToken) {
    try {
      // INCR command
      const incrRes = await fetch(`${upstashUrl}/incr/${key}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: "no-store",
      });
      const incrData = await incrRes.json();
      const currentCount = Number(incrData.result || 1);

      // If key was newly created, set TTL (windowSeconds)
      if (currentCount === 1) {
        await fetch(`${upstashUrl}/expire/${key}/${windowSeconds}`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
          cache: "no-store",
        });
      }

      // TTL command to calculate remaining reset time
      const ttlRes = await fetch(`${upstashUrl}/ttl/${key}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: "no-store",
      });
      const ttlData = await ttlRes.json();
      const ttlSeconds = Math.max(1, Number(ttlData.result || windowSeconds));

      const remaining = Math.max(0, limit - currentCount);
      const success = currentCount <= limit;

      return {
        success,
        limit,
        remaining,
        resetInSeconds: ttlSeconds,
      };
    } catch (upstashErr) {
      console.warn("Upstash Redis RateLimiter warning, falling back to memory:", upstashErr);
    }
  }

  // 2. In-Memory Sliding Window Fallback
  cleanupMemoryStore();
  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowSeconds * 1000;
    memoryStore.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetInSeconds: windowSeconds,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  const resetInSeconds = Math.ceil((existing.resetAt - now) / 1000);
  const success = existing.count <= limit;

  return {
    success,
    limit,
    remaining,
    resetInSeconds,
  };
}

/**
 * Returns a 429 Too Many Requests response with rate limit headers.
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: `Trop de requêtes ! Tu as dépassé la limite autorisée. Merci de patienter ${result.resetInSeconds} secondes.`,
      rateLimited: true,
      retryAfterSeconds: result.resetInSeconds,
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.resetInSeconds.toString(),
        "Retry-After": result.resetInSeconds.toString(),
      },
    }
  );
}
