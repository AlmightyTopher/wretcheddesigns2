import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

// Initialize Redis client (fallback to in-memory if Upstash not configured)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : undefined;

// Rate limiters for different endpoints
export const authRateLimit = new Ratelimit({
  redis: redis || new Map(), // Fallback to in-memory
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes
  analytics: true,
});

export const apiRateLimit = new Ratelimit({
  redis: redis || new Map(),
  limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 requests per minute
  analytics: true,
});

export const uploadRateLimit = new Ratelimit({
  redis: redis || new Map(),
  limiter: Ratelimit.slidingWindow(3, "1 m"), // 3 uploads per minute
  analytics: true,
});

export const contactRateLimit = new Ratelimit({
  redis: redis || new Map(),
  limiter: Ratelimit.slidingWindow(2, "1 h"), // 2 contact submissions per hour
  analytics: true,
});

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(",")[0].trim();

  return "127.0.0.1"; // Fallback
}

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
  rateLimit: Ratelimit,
  request: NextRequest,
  identifier?: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const id = identifier || getClientIP(request);

  try {
    const { success, limit, remaining, reset } = await rateLimit.limit(id);
    return { success, limit, remaining, reset };
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Fail open - allow request if rate limiting fails
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}

/**
 * Rate limiting middleware for API routes
 */
export async function withRateLimit(
  request: NextRequest,
  rateLimit: Ratelimit,
  identifier?: string
) {
  const result = await applyRateLimit(rateLimit, request, identifier);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        limit: result.limit,
        remaining: result.remaining,
        reset: new Date(result.reset).toISOString(),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset.toString(),
        },
      }
    );
  }

  return null; // Continue with request
}
