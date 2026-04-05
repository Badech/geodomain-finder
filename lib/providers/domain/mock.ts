import { BaseDomainProvider } from './base';
import { DomainAvailabilityResult } from '../types';

/**
 * Mock domain provider for demo mode
 * Simulates domain availability checks without making real API calls
 */
export class MockDomainProvider extends BaseDomainProvider {
  name = 'mock';

  async checkAvailability(domains: string[]): Promise<DomainAvailabilityResult[]> {
    // Simulate network delay
    await this.delay(300 + Math.random() * 200);

    return domains.map(domain => {
      const normalized = this.normalizeDomain(domain);
      
      // Simple heuristic: domains with common words are more likely to be taken
      const commonWords = ['google', 'amazon', 'facebook', 'microsoft', 'apple', 'best', 'top', 'premium'];
      const isTaken = commonWords.some(word => normalized.includes(word)) || Math.random() < 0.3;
      
      return {
        domain: normalized,
        available: !isTaken,
        status: isTaken ? 'taken' : 'available',
        checkedAt: new Date(),
        provider: this.name,
      };
    });
  }
}
