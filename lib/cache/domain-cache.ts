/**
 * Domain Availability Cache
 * Caches domain availability results to reduce API calls and improve performance
 */

import { DomainAvailabilityResult } from '../providers/types';

export interface CacheEntry {
  result: DomainAvailabilityResult;
  timestamp: number;
  expiresAt: number;
}

export class DomainAvailabilityCache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number;

  constructor(ttlMs: number = 24 * 60 * 60 * 1000) { // Default: 24 hours
    this.defaultTTL = ttlMs;
  }

  /**
   * Get cached result for a domain
   */
  get(domain: string): DomainAvailabilityResult | null {
    const normalized = this.normalizeDomain(domain);
    const entry = this.cache.get(normalized);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(normalized);
      return null;
    }

    // Return cached result with cache metadata
    return {
      ...entry.result,
      cacheHit: true,
      availabilitySource: `cache (${entry.result.provider})`,
    };
  }

  /**
   * Set cache entry for a domain
   */
  set(domain: string, result: DomainAvailabilityResult, ttlMs?: number): void {
    const normalized = this.normalizeDomain(domain);
    const ttl = ttlMs || this.defaultTTL;
    const timestamp = Date.now();

    this.cache.set(normalized, {
      result,
      timestamp,
      expiresAt: timestamp + ttl,
    });
  }

  /**
   * Get multiple cached results
   */
  getMultiple(domains: string[]): Map<string, DomainAvailabilityResult> {
    const results = new Map<string, DomainAvailabilityResult>();

    for (const domain of domains) {
      const result = this.get(domain);
      if (result) {
        results.set(domain, result);
      }
    }

    return results;
  }

  /**
   * Set multiple cache entries
   */
  setMultiple(results: DomainAvailabilityResult[], ttlMs?: number): void {
    for (const result of results) {
      this.set(result.domain, result, ttlMs);
    }
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalEntries: number;
    expiredEntries: number;
    activeEntries: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const now = Date.now();
    let expired = 0;
    let oldest: number | null = null;
    let newest: number | null = null;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      }

      if (oldest === null || entry.timestamp < oldest) {
        oldest = entry.timestamp;
      }

      if (newest === null || entry.timestamp > newest) {
        newest = entry.timestamp;
      }
    }

    return {
      totalEntries: this.cache.size,
      expiredEntries: expired,
      activeEntries: this.cache.size - expired,
      oldestEntry: oldest,
      newestEntry: newest,
    };
  }

  /**
   * Normalize domain for consistent cache keys
   */
  private normalizeDomain(domain: string): string {
    return domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .trim();
  }
}

// Singleton instance for the application
export const domainAvailabilityCache = new DomainAvailabilityCache();
