/**
 * Simple in-memory rate limiter
 * For production, use a Redis-based solution like @upstash/ratelimit
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private storage = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if a request should be rate limited
   * @param key - Unique identifier (e.g., IP address, user ID)
   * @returns true if rate limit exceeded, false otherwise
   */
  isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = this.storage.get(key);

    // No previous requests or window expired
    if (!entry || now >= entry.resetTime) {
      this.storage.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return false;
    }

    // Increment counter
    entry.count++;
    
    // Check if limit exceeded
    if (entry.count > this.config.maxRequests) {
      return true;
    }

    this.storage.set(key, entry);
    return false;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string): number {
    const now = Date.now();
    const entry = this.storage.get(key);

    if (!entry || now >= entry.resetTime) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - entry.count);
  }

  /**
   * Get time until reset (in seconds)
   */
  getResetTime(key: string): number {
    const now = Date.now();
    const entry = this.storage.get(key);

    if (!entry || now >= entry.resetTime) {
      return 0;
    }

    return Math.ceil((entry.resetTime - now) / 1000);
  }

  /**
   * Clean up expired entries
   */
  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now >= entry.resetTime) {
        this.storage.delete(key);
      }
    }
  }

  /**
   * Clear all rate limit data (useful for testing)
   */
  reset() {
    this.storage.clear();
  }
}

// Rate limiter instances for different operations

// Search API - 10 requests per 5 minutes
export const searchRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 10,
});

// General API - 100 requests per minute
export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
});

// Domain check - 50 requests per minute (expensive operation)
export const domainCheckRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 50,
});

/**
 * Get client identifier from request
 * In production, use proper IP detection considering proxies
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (adjust based on your hosting)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  
  // You could also use user ID if you have authentication
  // const userId = await getUserId(request);
  // return userId || ip;
  
  return ip;
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(resetTime: number) {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${resetTime} seconds.`,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': resetTime.toString(),
        'X-RateLimit-Reset': resetTime.toString(),
      },
    }
  );
}
