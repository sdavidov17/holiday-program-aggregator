/**
 * Rate Limiter for API endpoints
 * Prevents brute force attacks and DDoS
 */

import { LRUCache } from 'lru-cache';
import type { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitOptions {
  uniqueTokenPerInterval?: number;
  interval?: number;
  maxRequests?: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

// Different rate limiters for different endpoints
const limiters = new Map<string, LRUCache<string, number[]>>();

/**
 * Get or create a rate limiter for a specific endpoint
 */
function getLimiter(
  endpoint: string,
  uniqueTokenPerInterval: number = 500,
  interval: number = 60000, // 1 minute
): LRUCache<string, number[]> {
  if (!limiters.has(endpoint)) {
    limiters.set(
      endpoint,
      new LRUCache<string, number[]>({
        max: uniqueTokenPerInterval,
        ttl: interval,
      }),
    );
  }
  return limiters.get(endpoint)!;
}

/**
 * Get client identifier from request
 */
function getClientId(req: NextApiRequest): string {
  // Try to get real IP from various headers (for proxied requests)
  const forwarded = req.headers['x-forwarded-for'];
  const real = req.headers['x-real-ip'];

  let ip = 'unknown';
  if (forwarded) {
    const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    if (forwardedStr) {
      ip = forwardedStr.split(',')[0] || 'unknown';
    }
  } else if (real) {
    const realStr = Array.isArray(real) ? real[0] : real;
    if (realStr) {
      ip = realStr;
    }
  } else if (req.socket?.remoteAddress) {
    ip = req.socket.remoteAddress;
  }

  // For authenticated requests, use user ID as well
  const userId = (req as any).userId;

  return userId ? `${ip}:${userId}` : ip || 'unknown';
}

/**
 * Check if request should be rate limited
 */
export async function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  options: RateLimitOptions = {},
): Promise<RateLimitResult> {
  const {
    uniqueTokenPerInterval = 500,
    interval = 60000, // 1 minute
    maxRequests = 10,
  } = options;

  const endpoint = req.url || 'unknown';
  const clientId = getClientId(req);
  const limiter = getLimiter(endpoint, uniqueTokenPerInterval, interval);

  const now = Date.now();
  const windowStart = now - interval;

  // Get current request timestamps for this client
  let timestamps = limiter.get(clientId) || [];

  // Remove old timestamps outside the current window
  timestamps = timestamps.filter((t: number) => t > windowStart);

  // Check if limit exceeded
  if (timestamps.length >= maxRequests) {
    const firstTimestamp = timestamps[0];
    if (!firstTimestamp) {
      throw new Error('Invalid timestamp state');
    }
    const resetTime = new Date(firstTimestamp + interval);

    // Log rate limit violation
    console.warn('Rate limit exceeded', {
      clientId,
      endpoint,
      requests: timestamps.length,
      limit: maxRequests,
    });

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', resetTime.toISOString());
    res.setHeader('Retry-After', Math.ceil((resetTime.getTime() - now) / 1000).toString());

    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: resetTime,
    };
  }

  // Add current timestamp
  timestamps.push(now);
  limiter.set(clientId, timestamps);

  const remaining = maxRequests - timestamps.length;
  const resetTime = new Date(now + interval);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', resetTime.toISOString());

  return {
    success: true,
    limit: maxRequests,
    remaining,
    reset: resetTime,
  };
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options?: RateLimitOptions,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const result = await rateLimit(req, res, options);

    if (!result.success) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again after ${result.reset.toISOString()}`,
      });
    }

    return handler(req, res);
  };
}

/**
 * Strict rate limit for authentication endpoints
 */
export const authRateLimit = (req: NextApiRequest, res: NextApiResponse) =>
  rateLimit(req, res, {
    uniqueTokenPerInterval: 100, // Track 100 unique IPs
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  });

/**
 * Standard rate limit for API endpoints
 */
export const apiRateLimit = (req: NextApiRequest, res: NextApiResponse) =>
  rateLimit(req, res, {
    uniqueTokenPerInterval: 500,
    interval: 60000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  });

/**
 * Relaxed rate limit for public endpoints
 */
export const publicRateLimit = (req: NextApiRequest, res: NextApiResponse) =>
  rateLimit(req, res, {
    uniqueTokenPerInterval: 1000,
    interval: 60000,
    maxRequests: 200, // 200 requests per minute
  });

/**
 * Clear rate limit for a specific client (e.g., after successful login)
 */
export function clearRateLimit(endpoint: string, clientId: string) {
  const limiter = limiters.get(endpoint);
  if (limiter) {
    limiter.delete(clientId);
  }
}
