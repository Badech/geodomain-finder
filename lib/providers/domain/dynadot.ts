import { BaseDomainProvider } from './base';
import { DomainAvailabilityResult, ProviderError, RateLimitError } from '../types';

/**
 * Dynadot domain provider
 * Uses Dynadot Domain API for real domain availability checks
 * API Docs: https://www.dynadot.com/domain/api.html
 * 
 * Regular accounts support:
 * - 1 concurrent thread
 * - ~60 requests per minute (1 per second)
 */
export class DynadotDomainProvider extends BaseDomainProvider {
  name = 'dynadot';
  private apiKey: string;
  private baseUrl = 'https://api.dynadot.com/api3.json';
  private requestDelay = 1000; // 1 second delay between requests for regular accounts
  private requestQueue: Promise<any> = Promise.resolve(); // Ensures single-flight requests

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

    // CRITICAL: Dynadot only accepts ONE domain per request
    // Use controlled concurrency to check multiple domains in parallel
    const allResults: DomainAvailabilityResult[] = [...invalidResults];
    
    // Process domains with concurrency limit
    const results = await this.checkDomainsWithConcurrency(validDomains);
    allResults.push(...results);

    return allResults;
  }

  /**
   * Check multiple domains sequentially (Dynadot requires single-flight requests)
   * CRITICAL: Dynadot returns "currently processing another request" if concurrent
   */
  private async checkDomainsWithConcurrency(domains: string[]): Promise<DomainAvailabilityResult[]> {
    const results: DomainAvailabilityResult[] = [];
    
    console.log(`[Dynadot] Checking ${domains.length} domains sequentially (single-flight mode)`);
    
    // Process domains ONE AT A TIME using a queue
    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      
      // Chain onto the queue to ensure sequential execution
      this.requestQueue = this.requestQueue.then(async () => {
        const result = await this.checkSingleDomainWithRetry(domain);
        results.push(result);
        
        // Add delay between requests to avoid overwhelming Dynadot
        if (i < domains.length - 1) {
          await this.delay(this.requestDelay);
        }
      }).catch(error => {
        // If one request fails, don't break the chain
        console.error(`[Dynadot] Queue error for ${domain}:`, error);
      });
    }
    
    // Wait for all queued requests to complete
    await this.requestQueue;
    
    return results;
  }

  /**
   * Retry logic with exponential backoff for single domain
   */
  private async checkSingleDomainWithRetry(
    domain: string,
    maxRetries: number = 2
  ): Promise<DomainAvailabilityResult> {
    let lastError: Error | null = null;
    let isRetryable = true;
    
    // Retry loop: attempt 0, 1, 2 (total 3 attempts for maxRetries=2)
    for (let attempt = 0; attempt < maxRetries + 1; attempt++) {
      try {
        // Add exponential backoff for retries
        if (attempt > 0) {
          const backoffMs = Math.pow(2, attempt) * 1000; // 2s, 4s
          console.log(`[Dynadot] Retry ${attempt}/${maxRetries} for ${domain} (waiting ${backoffMs}ms)`);
          await this.delay(backoffMs);
        }
        
        return await this.checkSingleDomain(domain);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Classify error as retryable or non-retryable
        if (error instanceof RateLimitError) {
          console.warn(`[Dynadot] Rate limit hit for ${domain}, not retrying`);
          isRetryable = false;
          break;
        }
        
        // Don't retry request construction errors and concurrency errors
        if (error instanceof ProviderError && 
            (error.message.includes('too many domains') || 
             error.message.includes('no domains entered') ||
             error.message.includes('currently processing another request') ||
             error.message.includes('Invalid') ||
             error.message.includes('bad request'))) {
          console.warn(`[Dynadot] Non-retryable error for ${domain}: ${error.message}`);
          isRetryable = false;
          break;
        }
        
        // Log retry attempt for retryable errors
        if (attempt < maxRetries) {
          console.warn(`[Dynadot] Attempt ${attempt + 1}/${maxRetries + 1} failed for ${domain}:`, error.message);
        }
      }
    }
    
    // All retries failed or non-retryable error - return error status
    return {
      domain,
      available: false,
      status: 'error' as const,
      checkedAt: new Date(),
      checkedAtTimestamp: Date.now(),
      provider: this.name,
      error: isRetryable 
        ? `Failed after ${maxRetries + 1} attempts: ${lastError?.message}`
        : `Non-retryable error: ${lastError?.message}`,
      availabilitySource: this.name,
      providerResponseCode: 0,
    };
  }

  /**
   * Check a single domain (Dynadot requires domain0 parameter even for single domain)
   */
  async checkSingleDomain(domain: string): Promise<DomainAvailabilityResult> {
    const requestStartTime = Date.now();
    
    try {
      // Build the API request URL for SINGLE domain
      const url = new URL(this.baseUrl);
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('command', 'search');
      url.searchParams.append('domain0', domain); // CRITICAL: Dynadot requires domain0, not domain!

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'GeoDomainScout/1.0',
          'Accept': 'application/json',
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

      const responseText = await response.text();
      
      // Parse JSON response
      let jsonData: any;
      try {
        jsonData = JSON.parse(responseText);
      } catch (parseError) {
        if (process.env.DEBUG_DOMAINS === 'true') {
          const sanitizedUrl = url.toString().replace(/key=[^&]+/, 'key=***');
          console.error(`[Dynadot DEBUG] JSON parse failed for ${domain}`);
          console.error(`[Dynadot DEBUG] URL: ${sanitizedUrl}`);
          console.error(`[Dynadot DEBUG] Response: ${responseText.substring(0, 500)}`);
        }
        throw new ProviderError(
          `Failed to parse Dynadot JSON response: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`,
          this.name
        );
      }
      
      // Log request details in debug mode
      if (process.env.DEBUG_DOMAINS === 'true') {
        const sanitizedUrl = url.toString().replace(/key=[^&]+/, 'key=***');
        console.log(`\n[Dynadot DEBUG] ========================================`);
        console.log(`[Dynadot DEBUG] API Mode: JSON`);
        console.log(`[Dynadot DEBUG] Request URL: ${sanitizedUrl}`);
        console.log(`[Dynadot DEBUG] Domain parameter: domain0=${domain}`);
        console.log(`[Dynadot DEBUG] HTTP Status: ${response.status}`);
        console.log(`[Dynadot DEBUG] Raw JSON response:`);
        console.log(JSON.stringify(jsonData, null, 2));
        console.log(`[Dynadot DEBUG] ========================================\n`);
      }
      
      const result = this.parseJsonResponseSingle(jsonData, domain, response.status);
      
      // Log successful check with parsed details
      if (process.env.DEBUG_DOMAINS === 'true') {
        console.log(`[Dynadot DEBUG] Parsed result:`);
        console.log(`[Dynadot DEBUG]   - Domain: ${result.domain}`);
        console.log(`[Dynadot DEBUG]   - Available: ${result.available}`);
        console.log(`[Dynadot DEBUG]   - Status: ${result.status}`);
        if (result.error) {
          console.log(`[Dynadot DEBUG]   - Error: ${result.error}`);
        }
      }
      
      // CRITICAL: Alert if HTTP 200 but status=error
      if (response.status === 200 && result.status === 'error') {
        console.error(`[Dynadot] ⚠️  WARNING: HTTP 200 but normalized to error for ${domain}`);
        console.error(`[Dynadot] Error message: ${result.error}`);
        console.error(`[Dynadot] This indicates a parsing problem, not an API problem`);
        if (process.env.DEBUG_DOMAINS !== 'true') {
          console.error(`[Dynadot] Set DEBUG_DOMAINS=true to see full response`);
        }
      }
      
      console.log(`[Dynadot] ✓ ${domain} -> ${result.status} (${responseTime}ms)`);
      
      return result;
    } catch (error) {
      // Log error for debugging
      console.error(`[Dynadot] API error for ${domain}:`, error);
      
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

  /**
   * Parse single-domain JSON response with fallback strategies
   * Dynadot JSON API can return different structures
   */
  private parseJsonResponseSingle(
    jsonData: any,
    domain: string,
    httpStatus: number
  ): DomainAvailabilityResult {
    const checkedAt = new Date();
    const checkedAtTimestamp = Date.now();

    // STRATEGY 1: Check for API errors first
    if (jsonData.SearchResponse?.Error || jsonData.Error) {
      const errorMsg = jsonData.SearchResponse?.Error || jsonData.Error;
      throw new ProviderError(`Dynadot API error: ${errorMsg}`, this.name);
    }

    // STRATEGY 2: Try standard nested structure first
    let parseResult = this.tryParseStandardJsonStructure(jsonData, domain, httpStatus);
    if (parseResult) {
      if (process.env.DEBUG_DOMAINS === 'true') {
        console.log(`[Dynadot DEBUG] ✅ Parsed using STANDARD structure`);
      }
      return parseResult;
    }

    // STRATEGY 3: Try alternative flat structure
    parseResult = this.tryParseFlatJsonStructure(jsonData, domain, httpStatus);
    if (parseResult) {
      if (process.env.DEBUG_DOMAINS === 'true') {
        console.log(`[Dynadot DEBUG] ✅ Parsed using FLAT structure`);
      }
      return parseResult;
    }

    // STRATEGY 4: Try to find ANY availability information in the response
    parseResult = this.tryParseAnyAvailabilityInfo(jsonData, domain, httpStatus);
    if (parseResult) {
      if (process.env.DEBUG_DOMAINS === 'true') {
        console.log(`[Dynadot DEBUG] ✅ Parsed using FLEXIBLE search`);
      }
      return parseResult;
    }

    // ALL STRATEGIES FAILED - This is a true parse error
    console.error(`[Dynadot] ❌ CRITICAL: HTTP ${httpStatus} response but ALL parse strategies failed for ${domain}`);
    console.error(`[Dynadot] Response structure:`, JSON.stringify(jsonData, null, 2));
    
    return {
      domain,
      available: false,
      status: 'error' as const,
      checkedAt,
      checkedAtTimestamp,
      provider: this.name,
      error: `Parse failed: No recognizable structure in response. Enable DEBUG_DOMAINS=true for details.`,
      availabilitySource: this.name,
      providerResponseCode: httpStatus,
    };
  }

  /**
   * Try parsing standard Dynadot JSON structure:
   * SearchResponse -> DomainInfoList -> DomainInfo -> Domain/Available
   */
  private tryParseStandardJsonStructure(
    jsonData: any,
    domain: string,
    httpStatus: number
  ): DomainAvailabilityResult | null {
    const checkedAt = new Date();
    const checkedAtTimestamp = Date.now();

    const searchResponse = jsonData.SearchResponse;
    if (!searchResponse) return null;

    const domainInfoList = searchResponse.DomainInfoList;
    if (!domainInfoList) return null;

    let domainInfoArray = domainInfoList.DomainInfo;
    if (!Array.isArray(domainInfoArray)) {
      domainInfoArray = domainInfoArray ? [domainInfoArray] : [];
    }

    if (domainInfoArray.length === 0) return null;

    const domainInfo = domainInfoArray[0];
    const returnedDomain = domainInfo.Domain || domainInfo.domain || domainInfo.DomainName;
    const availableText = domainInfo.Available || domainInfo.available;

    if (!returnedDomain) return null;

    return this.createResultFromAvailability(
      returnedDomain,
      availableText,
      domainInfo.Price,
      checkedAt,
      checkedAtTimestamp,
      httpStatus
    );
  }

  /**
   * Try parsing flat structure: direct DomainInfo array
   */
  private tryParseFlatJsonStructure(
    jsonData: any,
    domain: string,
    httpStatus: number
  ): DomainAvailabilityResult | null {
    const checkedAt = new Date();
    const checkedAtTimestamp = Date.now();

    let domainInfoArray = jsonData.DomainInfo;
    if (!domainInfoArray) return null;

    if (!Array.isArray(domainInfoArray)) {
      domainInfoArray = [domainInfoArray];
    }

    if (domainInfoArray.length === 0) return null;

    const domainInfo = domainInfoArray[0];
    const returnedDomain = domainInfo.Domain || domainInfo.domain || domainInfo.DomainName;
    const availableText = domainInfo.Available || domainInfo.available;

    if (!returnedDomain) return null;

    return this.createResultFromAvailability(
      returnedDomain,
      availableText,
      domainInfo.Price,
      checkedAt,
      checkedAtTimestamp,
      httpStatus
    );
  }

  /**
   * Try to find ANY domain/availability information in the entire JSON tree
   */
  private tryParseAnyAvailabilityInfo(
    jsonData: any,
    domain: string,
    httpStatus: number
  ): DomainAvailabilityResult | null {
    const checkedAt = new Date();
    const checkedAtTimestamp = Date.now();

    // Search for any object with both Domain and Available fields
    const findDomainInfo = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return null;

      // Check if this object has domain and availability info
      const hasDomain = obj.Domain || obj.domain || obj.DomainName;
      const hasAvailable = obj.Available !== undefined || obj.available !== undefined;

      if (hasDomain && hasAvailable) return obj;

      // Recursively search in nested objects/arrays
      for (const key in obj) {
        const result = findDomainInfo(obj[key]);
        if (result) return result;
      }

      return null;
    };

    const domainInfo = findDomainInfo(jsonData);
    if (!domainInfo) return null;

    const returnedDomain = domainInfo.Domain || domainInfo.domain || domainInfo.DomainName;
    const availableText = domainInfo.Available || domainInfo.available;

    return this.createResultFromAvailability(
      returnedDomain,
      availableText,
      domainInfo.Price,
      checkedAt,
      checkedAtTimestamp,
      httpStatus
    );
  }

  /**
   * Create a result object from availability data
   */
  private createResultFromAvailability(
    returnedDomain: string,
    availableText: any,
    price: any,
    checkedAt: Date,
    checkedAtTimestamp: number,
    httpStatus: number
  ): DomainAvailabilityResult {
    const availableStr = availableText ? String(availableText).toLowerCase() : null;
    
    let status: 'available' | 'taken' | 'premium' | 'unknown' = 'unknown';
    let available = false;

    if (process.env.DEBUG_DOMAINS === 'true') {
      console.log(`[Dynadot DEBUG] Parsed fields:`);
      console.log(`[Dynadot DEBUG]   - Domain: "${returnedDomain}"`);
      console.log(`[Dynadot DEBUG]   - Available: "${availableStr}"`);
      console.log(`[Dynadot DEBUG]   - Price: "${price}"`);
    }

    // Map availability status - be flexible with the value
    if (availableStr === 'yes' || availableStr === 'true' || availableStr === '1') {
      status = 'available';
      available = true;
    } else if (availableStr === 'no' || availableStr === 'false' || availableStr === '0') {
      status = 'taken';
      available = false;
    } else if (availableStr === null || availableStr === undefined || availableStr === '') {
      // If Available field is missing but we got here, something is wrong
      status = 'unknown';
      available = false;
      console.warn(`[Dynadot] Missing availability value for ${returnedDomain}`);
    } else {
      // Unexpected value
      status = 'unknown';
      available = false;
      console.warn(`[Dynadot] Unclear availability for ${returnedDomain}: availableText="${availableStr}"`);
    }

    return {
      domain: returnedDomain,
      available,
      status,
      checkedAt,
      checkedAtTimestamp,
      provider: this.name,
      availabilitySource: this.name,
      providerResponseCode: httpStatus,
    };
  }

  /**
   * Parse XML response for a single domain
   * Dynadot XML structure: <SearchResponse><SearchHeader>...</SearchHeader><DomainInfoList><DomainInfo>...</DomainInfo></DomainInfoList></SearchResponse>
   */
  private parseXmlResponseSingle(
    xmlText: string,
    domain: string,
    httpStatus: number
  ): DomainAvailabilityResult {
    const checkedAt = new Date();
    const checkedAtTimestamp = Date.now();

    // Check for errors
    if (xmlText.includes('<Error>')) {
      const errorMatch = xmlText.match(/<Error>(.*?)<\/Error>/);
      const errorMsg = errorMatch ? errorMatch[1] : 'Unknown API error';
      throw new ProviderError(`Dynadot API error: ${errorMsg}`, this.name);
    }

    // Try multiple XML patterns to find domain info
    // Pattern 1: <DomainInfo> directly
    let domainInfoMatch = xmlText.match(/<DomainInfo[^>]*>([\s\S]*?)<\/DomainInfo>/);
    
    // Pattern 2: Inside <DomainInfoList>
    if (!domainInfoMatch) {
      const listMatch = xmlText.match(/<DomainInfoList[^>]*>([\s\S]*?)<\/DomainInfoList>/);
      if (listMatch) {
        domainInfoMatch = listMatch[1].match(/<DomainInfo[^>]*>([\s\S]*?)<\/DomainInfo>/);
      }
    }

    if (!domainInfoMatch) {
      if (process.env.DEBUG_DOMAINS === 'true') {
        console.warn(`[Dynadot] XML parsing failed for ${domain}`);
        console.warn(`[Dynadot] Looking for: <DomainInfo> or <DomainInfoList><DomainInfo>`);
        console.warn(`[Dynadot] XML snippet: ${xmlText.substring(0, 300)}`);
      }
      
      return {
        domain,
        available: false,
        status: 'error' as const,
        checkedAt,
        checkedAtTimestamp,
        provider: this.name,
        error: 'No domain information in API response (XML parse failed)',
        availabilitySource: this.name,
        providerResponseCode: httpStatus,
      };
    }

    const domainInfo = domainInfoMatch[1];
    
    // Extract domain name and availability
    const domainMatch = domainInfo.match(/<Domain>(.*?)<\/Domain>/);
    const availableMatch = domainInfo.match(/<Available>(.*?)<\/Available>/);

    if (!domainMatch) {
      if (process.env.DEBUG_DOMAINS === 'true') {
        console.warn(`[Dynadot] No <Domain> tag found in DomainInfo for ${domain}`);
        console.warn(`[Dynadot] DomainInfo content: ${domainInfo.substring(0, 200)}`);
      }
      
      return {
        domain,
        available: false,
        status: 'error' as const,
        checkedAt,
        checkedAtTimestamp,
        provider: this.name,
        error: 'Domain tag not found in API response',
        availabilitySource: this.name,
        providerResponseCode: httpStatus,
      };
    }

    const returnedDomain = domainMatch[1];
    const availableText = availableMatch ? availableMatch[1].toLowerCase() : null;
    
    let status: 'available' | 'taken' | 'premium' | 'unknown' = 'unknown';
    let available = false;

    if (process.env.DEBUG_DOMAINS === 'true') {
      console.log(`[Dynadot DEBUG] Parsed: domain="${returnedDomain}", available="${availableText}"`);
    }

    // Only mark as taken when Dynadot explicitly says "no"
    if (availableText === 'yes') {
      status = 'available';
      available = true;
    } else if (availableText === 'no') {
      status = 'taken';
      available = false;
    } else {
      // If availability is unclear, mark as unknown (not taken!)
      status = 'unknown';
      available = false;
      console.warn(`[Dynadot] Unclear availability for ${returnedDomain}: availableText="${availableText}"`);
    }

    return {
      domain: returnedDomain,
      available,
      status,
      checkedAt,
      checkedAtTimestamp,
      provider: this.name,
      availabilitySource: this.name,
      providerResponseCode: httpStatus,
    };
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
        
        let status: 'available' | 'taken' | 'premium' | 'unknown' = 'unknown';
        let available = false;

        // Only mark as taken when Dynadot explicitly says "no"
        if (availableText === 'yes') {
          status = 'available';
          available = true;
        } else if (availableText === 'no') {
          status = 'taken';
          available = false;
        } else {
          // If availability is unclear, mark as unknown (not taken!)
          status = 'unknown';
          available = false;
          console.warn(`[Dynadot] Unclear availability for ${domain}: availableText="${availableText}"`);
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
