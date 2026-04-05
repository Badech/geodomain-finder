import { DomainProvider, DomainAvailabilityResult } from '../types';

/**
 * Abstract base class for domain providers
 * Provides common functionality and enforces interface compliance
 */
export abstract class BaseDomainProvider implements DomainProvider {
  abstract name: string;

  /**
   * Check availability for multiple domains
   */
  abstract checkAvailability(domains: string[]): Promise<DomainAvailabilityResult[]>;

  /**
   * Check availability for a single domain (convenience method)
   */
  async checkSingleDomain(domain: string): Promise<DomainAvailabilityResult> {
    const results = await this.checkAvailability([domain]);
    return results[0];
  }

  /**
   * Normalize domain string (remove http/https, www, trailing slashes)
   */
  protected normalizeDomain(domain: string): string {
    return domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .trim();
  }

  /**
   * Validate domain format
   */
  protected isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/i;
    return domainRegex.test(domain);
  }

  /**
   * Batch domains into chunks for rate limiting
   */
  protected chunkDomains(domains: string[], chunkSize: number): string[][] {
    const chunks: string[][] = [];
    for (let i = 0; i < domains.length; i += chunkSize) {
      chunks.push(domains.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Delay execution (for rate limiting)
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
