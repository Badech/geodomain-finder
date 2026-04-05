import { BaseDomainProvider } from './base';
import { DomainAvailabilityResult, ProviderError, RateLimitError } from '../types';

/**
 * Dynadot domain provider
 * Uses Dynadot Domain API for real domain availability checks
 * API Docs: https://www.dynadot.com/domain/api.html
 */
export class DynadotDomainProvider extends BaseDomainProvider {
  name = 'dynadot';
  private apiKey: string;
  private baseUrl = 'https://api.dynadot.com/api3.xml';
  private maxDomainsPerRequest = 100;
  private requestDelay = 1000; // 1 second between requests for rate limiting

  constructor(apiKey: string) {
    super();
    if (!apiKey) {
      throw new Error('Dynadot API key is required');
    }
    this.apiKey = apiKey;
  }

  async checkAvailability(domains: string[]): Promise<DomainAvailabilityResult[]> {
    // Normalize and validate all domains
    const normalizedDomains = domains.map(d => this.normalizeDomain(d));
    const invalidDomains = normalizedDomains.filter(d => !this.isValidDomain(d));
    
    if (invalidDomains.length > 0) {
      throw new ProviderError(
        `Invalid domain format: ${invalidDomains.join(', ')}`,
        this.name
      );
    }

    // Split into chunks to respect API limits
    const chunks = this.chunkDomains(normalizedDomains, this.maxDomainsPerRequest);
    const allResults: DomainAvailabilityResult[] = [];

    for (let i = 0; i < chunks.length; i++) {
      if (i > 0) {
        await this.delay(this.requestDelay);
      }
      
      const chunkResults = await this.checkChunk(chunks[i]);
      allResults.push(...chunkResults);
    }

    return allResults;
  }

  private async checkChunk(domains: string[]): Promise<DomainAvailabilityResult[]> {
    try {
      // Build the API request URL
      const url = new URL(this.baseUrl);
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('command', 'search');
      
      // Add all domains as domain0, domain1, domain2, etc.
      domains.forEach((domain, index) => {
        url.searchParams.append(`domain${index}`, domain);
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'GeoDomainScout/1.0',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new RateLimitError(this.name, 60);
        }
        throw new ProviderError(
          `Dynadot API request failed: ${response.status} ${response.statusText}`,
          this.name
        );
      }

      const xmlText = await response.text();
      return this.parseXmlResponse(xmlText, domains);
    } catch (error) {
      if (error instanceof ProviderError || error instanceof RateLimitError) {
        throw error;
      }
      throw new ProviderError(
        `Failed to check domain availability: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  private parseXmlResponse(xmlText: string, requestedDomains: string[]): DomainAvailabilityResult[] {
    const results: DomainAvailabilityResult[] = [];
    const checkedAt = new Date();

    // Parse XML response (simple string parsing for reliability)
    // Dynadot returns: <SearchResponse><SearchHeader>...</SearchHeader><DomainInfoList><DomainInfo>...</DomainInfo></DomainInfoList></SearchResponse>
    
    // Check for errors
    if (xmlText.includes('<Error>')) {
      const errorMatch = xmlText.match(/<Error>(.*?)<\/Error>/);
      const errorMsg = errorMatch ? errorMatch[1] : 'Unknown API error';
      throw new ProviderError(`Dynadot API error: ${errorMsg}`, this.name);
    }

    // Parse each domain result
    const domainInfoRegex = /<DomainInfo>([\s\S]*?)<\/DomainInfo>/g;
    const matches = Array.from(xmlText.matchAll(domainInfoRegex));

    if (matches.length === 0) {
      // If no results found, mark all as unknown
      return requestedDomains.map(domain => ({
        domain,
        available: false,
        status: 'unknown' as const,
        checkedAt,
        provider: this.name,
        error: 'No response data from API',
      }));
    }

    for (const match of matches) {
      const domainInfo = match[1];
      const domainMatch = domainInfo.match(/<Domain>(.*?)<\/Domain>/);
      const availableMatch = domainInfo.match(/<Available>(.*?)<\/Available>/);

      if (domainMatch) {
        const domain = domainMatch[1];
        const isAvailable = availableMatch ? availableMatch[1].toLowerCase() === 'yes' : false;

        results.push({
          domain,
          available: isAvailable,
          status: isAvailable ? 'available' : 'taken',
          checkedAt,
          provider: this.name,
        });
      }
    }

    return results;
  }
}
