/**
 * Server-side Rate Limiting & Lookup Caching
 */
import { NormalizedVehicleLookupResponse } from '../../types';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface CacheRecord {
  data: NormalizedVehicleLookupResponse;
  expiresAt: number;
}

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 20; // 20 lookups per 15 minutes per IP
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache for successful lookups

class VehicleLookupCacheAndLimiter {
  private ipLimits = new Map<string, RateLimitRecord>();
  private cache = new Map<string, CacheRecord>();

  /**
   * Checks whether the client IP has exceeded the allowed rate limit
   */
  public checkRateLimit(clientIp: string): { allowed: boolean; remaining: number; resetInSec: number } {
    const now = Date.now();
    const record = this.ipLimits.get(clientIp);

    if (!record || now > record.resetAt) {
      this.ipLimits.set(clientIp, {
        count: 1,
        resetAt: now + WINDOW_MS,
      });
      return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetInSec: Math.ceil(WINDOW_MS / 1000) };
    }

    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
      const resetInSec = Math.ceil((record.resetAt - now) / 1000);
      return { allowed: false, remaining: 0, resetInSec };
    }

    record.count += 1;
    const remaining = MAX_REQUESTS_PER_WINDOW - record.count;
    const resetInSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: true, remaining, resetInSec };
  }

  /**
   * Retrieves cached response for registration number if still valid
   */
  public getCached(registrationNumber: string): NormalizedVehicleLookupResponse | null {
    const key = registrationNumber.toUpperCase();
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Stores successful response in cache
   */
  public setCached(registrationNumber: string, data: NormalizedVehicleLookupResponse): void {
    if (!data.success || !data.vehicle) return;
    const key = registrationNumber.toUpperCase();
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  /**
   * Cleanup old records periodically
   */
  public cleanup(): void {
    const now = Date.now();
    for (const [key, val] of this.cache.entries()) {
      if (now > val.expiresAt) this.cache.delete(key);
    }
    for (const [ip, val] of this.ipLimits.entries()) {
      if (now > val.resetAt) this.ipLimits.delete(ip);
    }
  }
}

export const lookupLimiterAndCache = new VehicleLookupCacheAndLimiter();

// Run periodic cleanup every 10 minutes
setInterval(() => {
  lookupLimiterAndCache.cleanup();
}, 10 * 60 * 1000);
