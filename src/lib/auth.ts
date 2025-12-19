import { NextRequest } from "next/server";

// Simple in-memory rate limiter (use Redis in production for multi-instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute

export interface AuthResult {
  authorized: boolean;
  error?: string;
  userId?: string;
}

/**
 * Validates API key from request headers
 * Supports both Bearer token and X-API-Key header formats
 */
export function validateApiKey(request: NextRequest): AuthResult {
  const authHeader = request.headers.get("authorization");
  const apiKeyHeader = request.headers.get("x-api-key");

  // Check for API key in environment (for simple auth)
  const validApiKey = process.env.LOOPLET_API_KEY;

  // If no API key is configured, allow all requests (development mode)
  if (!validApiKey) {
    return { authorized: true, userId: "anonymous" };
  }

  let providedKey: string | null = null;

  // Check Bearer token first
  if (authHeader?.startsWith("Bearer ")) {
    providedKey = authHeader.slice(7);
  } else if (apiKeyHeader) {
    providedKey = apiKeyHeader;
  }

  if (!providedKey) {
    return {
      authorized: false,
      error: "API key required. Provide via 'Authorization: Bearer <key>' or 'X-API-Key' header",
    };
  }

  if (providedKey !== validApiKey) {
    return {
      authorized: false,
      error: "Invalid API key",
    };
  }

  return { authorized: true, userId: providedKey.slice(0, 8) };
}

/**
 * Rate limiter based on IP address
 */
export function checkRateLimit(request: NextRequest): { allowed: boolean; error?: string; remaining?: number } {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
             request.headers.get("x-real-ip") ||
             "unknown";

  const now = Date.now();
  const windowData = rateLimitMap.get(ip);

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!windowData || windowData.resetTime < now) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (windowData.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((windowData.resetTime - now) / 1000);
    return {
      allowed: false,
      error: `Rate limit exceeded. Try again in ${retryAfter} seconds`,
      remaining: 0,
    };
  }

  windowData.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - windowData.count };
}

/**
 * Combined auth and rate limit check
 */
export function authorizeRequest(request: NextRequest): {
  authorized: boolean;
  error?: string;
  status?: number;
  userId?: string;
  rateLimit?: { remaining: number };
} {
  // Check rate limit first
  const rateCheck = checkRateLimit(request);
  if (!rateCheck.allowed) {
    return {
      authorized: false,
      error: rateCheck.error,
      status: 429,
    };
  }

  // Then check API key
  const authCheck = validateApiKey(request);
  if (!authCheck.authorized) {
    return {
      authorized: false,
      error: authCheck.error,
      status: 401,
    };
  }

  return {
    authorized: true,
    userId: authCheck.userId,
    rateLimit: { remaining: rateCheck.remaining || 0 },
  };
}
