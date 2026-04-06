import { BaseDomainProvider } from './base';
import { DomainAvailabilityResult } from '../types';

/**
 * Mock domain provider for demo mode
 * Simulates domain availability checks without making real API calls
 * Uses deterministic hashing for consistent results
 */
export class MockDomainProvider extends BaseDomainProvider {
  name = 'mock';

  async checkAvailability(domains: string[]): Promise<DomainAvailabilityResult[]> {
    // Simulate network delay
    await this.delay(300 + Math.random() * 200);

    return domains.map(domain => {
      const normalized = this.normalizeDomain(domain);
      
      // Deterministic availability based on domain hash
      const availability = this.calculateMockAvailability(normalized);
      
      return {
        domain: normalized,
        available: availability.available,
        status: availability.status,
        checkedAt: new Date(),
        checkedAtTimestamp: Date.now(),
        provider: this.name,
        availabilitySource: 'mock-provider',
        providerResponseCode: 200,
      };
    });
  }

  /**
   * Calculate deterministic mock availability based on domain characteristics
   * This ensures consistent results for the same domain across multiple checks
   */
  private calculateMockAvailability(domain: string): {
    available: boolean;
    status: 'available' | 'taken' | 'premium';
  } {
    // Common/premium words that are always taken
    const premiumWords = ['google', 'amazon', 'facebook', 'microsoft', 'apple'];
    
    // Check for premium keywords (always taken)
    if (premiumWords.some(word => domain.includes(word))) {
      return { available: false, status: 'taken' };
    }

    // Use hash-based deterministic availability for other domains
    const hash = this.simpleHash(domain);
    
    // Very short domains (< 8 chars) are more likely taken
    const domainName = domain.replace('.com', '').replace('.net', '').replace('.org', '');
    if (domainName.length < 8) {
      return hash % 100 < 50 ? { available: false, status: 'taken' } : { available: true, status: 'available' };
    }

    // Short domains (8-12 chars) - good availability for demo
    if (domainName.length < 12) {
      return hash % 100 < 30 ? { available: false, status: 'taken' } : { available: true, status: 'available' };
    }

    // Medium domains (12-18 chars) - very good availability
    if (domainName.length < 18) {
      return hash % 100 < 20 ? { available: false, status: 'taken' } : { available: true, status: 'available' };
    }

    // Long domains (18+ chars) are almost always available
    return hash % 100 < 10 ? { available: false, status: 'taken' } : { available: true, status: 'available' };
  }

  /**
   * Simple hash function for deterministic results
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
