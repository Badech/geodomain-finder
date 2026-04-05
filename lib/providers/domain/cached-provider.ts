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

  constructor(baseProvider: DomainProvider, cache?: DomainAvailabilityCache) {
    this.baseProvider = baseProvider;
    this.cache = cache || domainAvailabilityCache;
    this.name = `cached-${baseProvider.name}`;
  }

  async checkAvailability(domains: string[]): Promise<DomainAvailabilityResult[]> {
    const results: DomainAvailabilityResult[] = [];
    const domainsToCheck: string[] = [];
    
    // Check cache first
    for (const domain of domains) {
      const cached = this.cache.get(domain);
      if (cached) {
        results.push(cached);
      } else {
        domainsToCheck.push(domain);
      }
    }

    // If all results were cached, return immediately
    if (domainsToCheck.length === 0) {
      console.log(`Cache hit: ${domains.length}/${domains.length} domains`);
      return results;
    }

    console.log(`Cache hit: ${results.length}/${domains.length} domains, checking ${domainsToCheck.length}`);

    // Check remaining domains with base provider
    try {
      const freshResults = await this.baseProvider.checkAvailability(domainsToCheck);
      
      // Cache the fresh results
      this.cache.setMultiple(freshResults);
      
      // Combine cached and fresh results
      results.push(...freshResults);
      
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
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): number {
    return this.cache.clearExpired();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}
