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
    const premiumWords = ['google', 'amazon', 'facebook', 'microsoft', 'apple', 'insurance', 'lawyer', 'attorney'];
    const commonWords = ['best', 'top', 'premium', 'pro', 'expert', 'cheap', 'free'];
    
    // Check for premium keywords (always taken)
    if (premiumWords.some(word => domain.includes(word))) {
      return { available: false, status: 'taken' };
    }

    // Check for common words (likely taken)
    if (commonWords.some(word => domain.includes(word))) {
      return { available: false, status: 'taken' };
    }

    // Use hash-based deterministic availability for other domains
    const hash = this.simpleHash(domain);
    
    // Very short domains (< 10 chars) are more likely taken
    const domainName = domain.replace('.com', '');
    if (domainName.length < 10) {
      return hash % 100 < 70 ? { available: false, status: 'taken' } : { available: true, status: 'available' };
    }

    // Short domains (10-15 chars) are moderately likely taken
    if (domainName.length < 15) {
      return hash % 100 < 50 ? { available: false, status: 'taken' } : { available: true, status: 'available' };
    }

    // Longer domains (15-20 chars) are more likely available
    if (domainName.length < 20) {
      return hash % 100 < 35 ? { available: false, status: 'taken' } : { available: true, status: 'available' };
    }

    // Very long domains (20+ chars) are usually available
    return hash % 100 < 20 ? { available: false, status: 'taken' } : { available: true, status: 'available' };
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
