/**
 * Cached Domain Provider Wrapper
 * Wraps any domain provider with caching functionality
 */

import { DomainProvider, DomainAvailabilityResult } from '../types';
import { domainAvailabilityCache, DomainAvailabilityCache } from '../../cache/domain-cache';

export class CachedDomainProvider implements DomainProvider {
  name: string;
  private baseProvider: DomainProvider;
  private cache: DomainAvailabilityCache;
  private bypassCache: boolean = false;

  constructor(baseProvider: DomainProvider, cache?: DomainAvailabilityCache) {
    this.baseProvider = baseProvider;
    this.cache = cache || domainAvailabilityCache;
    this.name = `cached-${baseProvider.name}`;
    
    // Enable cache bypass in development when DEBUG_DOMAINS env var is set
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_DOMAINS === 'true') {
      this.bypassCache = true;
      console.log('[CachedDomainProvider] ⚠️ Cache bypass enabled via DEBUG_DOMAINS=true');
    }
  }

  async checkAvailability(domains: string[]): Promise<DomainAvailabilityResult[]> {
    const startTime = Date.now();
    const results: DomainAvailabilityResult[] = [];
    const domainsToCheck: string[] = [];
    
    // Check cache first (unless bypassed)
    if (!this.bypassCache) {
      for (const domain of domains) {
        const cached = this.cache.get(domain);
        if (cached) {
          results.push(cached);
        } else {
          domainsToCheck.push(domain);
        }
      }
    } else {
      console.log('[Cache] BYPASSED - forcing fresh lookups for all domains');
      domainsToCheck.push(...domains);
    }

    // If all results were cached, return immediately
    if (domainsToCheck.length === 0) {
      const stats = this.cache.getStats();
      console.log(`[Cache] ⚡ All ${domains.length} domains served from cache (hit rate: ${stats.hitRate}%)`);
      return results;
    }

    const cacheHits = results.length;
    const cacheMisses = domainsToCheck.length;
    console.log(`[Cache] ${cacheHits} hits, ${cacheMisses} misses (${((cacheHits / domains.length) * 100).toFixed(1)}% hit rate)`);

    // Check remaining domains with base provider
    try {
      const providerStartTime = Date.now();
      const freshResults = await this.baseProvider.checkAvailability(domainsToCheck);
      const providerTime = Date.now() - providerStartTime;
      
      // Cache the fresh results (cache will skip error/unknown statuses)
      const cachedCount = this.cache.setMultiple(freshResults);
      
      // Combine cached and fresh results
      results.push(...freshResults);
      
      const totalTime = Date.now() - startTime;
      console.log(`[Cache] ⚡ Provider check: ${(providerTime / 1000).toFixed(1)}s for ${domainsToCheck.length} domains (${(providerTime / domainsToCheck.length).toFixed(0)}ms avg)`);
      console.log(`[Cache] 💾 Cached ${cachedCount} new results`);
      
      return results;
    } catch (error) {
      console.error('Failed to check domains with base provider:', error);
      
      // If provider fails completely, return what we have from cache
      // and add error results for uncached domains
      const errorResults: DomainAvailabilityResult[] = domainsToCheck.map(domain => ({
        domain,
        available: false,
        status: 'error' as const,
        checkedAt: new Date(),
        checkedAtTimestamp: Date.now(),
        provider: this.baseProvider.name,
        error: error instanceof Error ? error.message : 'Provider failed',
        availabilitySource: this.baseProvider.name,
        providerResponseCode: 0,
      }));
      
      results.push(...errorResults);
      return results;
    }
  }

  async checkSingleDomain(domain: string): Promise<DomainAvailabilityResult> {
    const results = await this.checkAvailability([domain]);
    return results[0];
  }

  /**
   * Enable or disable cache bypass (useful for debugging)
   */
  setCacheBypass(bypass: boolean): void {
    this.bypassCache = bypass;
    console.log(`[CachedDomainProvider] Cache bypass ${bypass ? 'enabled' : 'disabled'}`);
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[CachedDomainProvider] Cache cleared');
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): number {
    const cleared = this.cache.clearExpired();
    console.log(`[CachedDomainProvider] Cleared ${cleared} expired entries`);
    return cleared;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}
