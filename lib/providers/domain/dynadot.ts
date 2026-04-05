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
    // Normalize domains first
    const normalizedDomains = domains.map(d => this.normalizeDomain(d));
    
    // Separate valid and invalid domains
    const validDomains: string[] = [];
    const invalidResults: DomainAvailabilityResult[] = [];
    
    for (const domain of normalizedDomains) {
      if (!this.isValidDomain(domain)) {
        // Return invalid status for malformed domains instead of throwing
        invalidResults.push({
          domain,
          available: false,
          status: 'invalid',
          checkedAt: new Date(),
          checkedAtTimestamp: Date.now(),
          provider: this.name,
          error: 'Invalid domain format',
          availabilitySource: this.name,
          providerResponseCode: 0,
        });
      } else {
        validDomains.push(domain);
      }
    }

    // If no valid domains, return only invalid results
    if (validDomains.length === 0) {
      return invalidResults;
    }

    // Split valid domains into chunks to respect API limits
    const chunks = this.chunkDomains(validDomains, this.maxDomainsPerRequest);
    const allResults: DomainAvailabilityResult[] = [...invalidResults];

    // Process chunks with retry logic
    for (let i = 0; i < chunks.length; i++) {
      if (i > 0) {
        await this.delay(this.requestDelay);
      }
      
      const chunkResults = await this.checkChunkWithRetry(chunks[i]);
      allResults.push(...chunkResults);
    }

    return allResults;
  }

  /**
   * Check chunk with retry logic for transient failures
   */
  private async checkChunkWithRetry(
    domains: string[],
    maxRetries: number = 2
  ): Promise<DomainAvailabilityResult[]> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add exponential backoff for retries
        if (attempt > 0) {
          const backoffMs = Math.pow(2, attempt) * 1000; // 2s, 4s
          await this.delay(backoffMs);
        }
        
        return await this.checkChunk(domains);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on rate limit errors (need longer wait)
        if (error instanceof RateLimitError) {
          break;
        }
        
        // Don't retry on validation errors
        if (error instanceof ProviderError && error.message.includes('Invalid')) {
          break;
        }
        
        // Log retry attempt
        console.warn(`Dynadot API retry ${attempt + 1}/${maxRetries} for ${domains.length} domains:`, error);
      }
    }
    
    // All retries failed - return error status for each domain
    return domains.map(domain => ({
      domain,
      available: false,
      status: 'error' as const,
      checkedAt: new Date(),
      checkedAtTimestamp: Date.now(),
      provider: this.name,
      error: lastError?.message || 'Failed to check availability after retries',
      availabilitySource: this.name,
      providerResponseCode: 0,
    }));
  }

  private async checkChunk(domains: string[]): Promise<DomainAvailabilityResult[]> {
    const requestStartTime = Date.now();
    
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
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      const responseTime = Date.now() - requestStartTime;

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
      const results = this.parseXmlResponse(xmlText, domains, response.status);
      
      // Log successful check for debugging
      console.log(`Dynadot: Checked ${domains.length} domains in ${responseTime}ms`);
      
      return results;
    } catch (error) {
      // Log error for debugging
      console.error(`Dynadot API error for ${domains.length} domains:`, error);
      
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

  private parseXmlResponse(
    xmlText: string,
    requestedDomains: string[],
    httpStatus: number
  ): DomainAvailabilityResult[] {
    const results: DomainAvailabilityResult[] = [];
    const checkedAt = new Date();
    const checkedAtTimestamp = Date.now();

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
      // If no results found, return error status instead of unknown
      console.warn('Dynadot: No domain info found in XML response');
      return requestedDomains.map(domain => ({
        domain,
        available: false,
        status: 'error' as const,
        checkedAt,
        checkedAtTimestamp,
        provider: this.name,
        error: 'No domain information in API response',
        availabilitySource: this.name,
        providerResponseCode: httpStatus,
      }));
    }

    // Create a map of results by domain
    const resultMap = new Map<string, DomainAvailabilityResult>();

    for (const match of matches) {
      const domainInfo = match[1];
      const domainMatch = domainInfo.match(/<Domain>(.*?)<\/Domain>/);
      const availableMatch = domainInfo.match(/<Available>(.*?)<\/Available>/);

      if (domainMatch) {
        const domain = domainMatch[1];
        const availableText = availableMatch ? availableMatch[1].toLowerCase() : null;
        
        let status: 'available' | 'taken' | 'premium' = 'taken';
        let available = false;

        if (availableText === 'yes') {
          status = 'available';
          available = true;
        } else if (availableText === 'no') {
          status = 'taken';
          available = false;
        } else {
          // If availability is unclear, mark as error
          status = 'taken';
          available = false;
        }

        resultMap.set(domain, {
          domain,
          available,
          status,
          checkedAt,
          checkedAtTimestamp,
          provider: this.name,
          availabilitySource: this.name,
          providerResponseCode: httpStatus,
        });
      }
    }

    // Ensure all requested domains have results
    for (const domain of requestedDomains) {
      const result = resultMap.get(domain);
      if (result) {
        results.push(result);
      } else {
        // Domain was requested but not in response
        results.push({
          domain,
          available: false,
          status: 'error' as const,
          checkedAt,
          checkedAtTimestamp,
          provider: this.name,
          error: 'Domain not found in API response',
          availabilitySource: this.name,
          providerResponseCode: httpStatus,
        });
      }
    }

    return results;
  }
}
