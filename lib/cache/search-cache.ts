/**
 * PHASE 4: Comprehensive search result caching
 * Caches complete search results to speed up repeated queries
 */

import { SearchResult } from '../services/search-orchestrator';

interface CacheEntry {
  result: SearchResult;
  timestamp: number;
}

export class SearchCache {
  private cache: Map<string, CacheEntry>;
  private ttl: number;

  constructor(ttlMinutes: number = 60) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Generate cache key from search parameters
   */
  private getCacheKey(params: {
    niche: string;
    city: string;
    state: string;
    modifiers?: string[];
  }): string {
    const modifiersStr = (params.modifiers || []).sort().join(',');
    return `${params.niche}|${params.city}|${params.state}|${modifiersStr}`.toLowerCase();
  }

  /**
   * Get cached search result if available and not expired
   */
  get(params: {
    niche: string;
    city: string;
    state: string;
    modifiers?: string[];
  }): SearchResult | null {
    const key = this.getCacheKey(params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  /**
   * Store search result in cache
   */
  set(
    params: {
      niche: string;
      city: string;
      state: string;
      modifiers?: string[];
    },
    result: SearchResult
  ): void {
    const key = this.getCacheKey(params);
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
    };
  }
}

// Global cache instance (singleton)
export const globalSearchCache = new SearchCache(60); // 60 minute TTL
