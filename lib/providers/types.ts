// Provider interface types

// Domain Provider
export interface DomainAvailabilityResult {
  domain: string;
  available: boolean;
  status: 'available' | 'taken' | 'premium' | 'invalid' | 'error' | 'unknown';
  checkedAt: Date;
  provider?: string;
  error?: string;
  // Enhanced metadata for debugging and transparency
  availabilitySource?: string; // Which provider/cache returned this result
  providerResponseCode?: number; // HTTP status or API response code
  checkedAtTimestamp?: number; // Unix timestamp for easier comparison
  cacheHit?: boolean; // Whether this came from cache
}

export interface DomainProvider {
  name: string;
  checkAvailability(domains: string[]): Promise<DomainAvailabilityResult[]>;
  checkSingleDomain?(domain: string): Promise<DomainAvailabilityResult>;
}

// Lead Provider
export interface BusinessLeadSeed {
  placeId?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
}

export interface BusinessLeadDetails extends BusinessLeadSeed {
  email?: string;
  currentDomain?: string;
  businessHours?: Record<string, string>;
  photos?: string[];
}

export interface LeadSearchParams {
  niche: string;
  city: string;
  state: string;
  maxResults?: number;
}

export interface LeadProvider {
  name: string;
  searchBusinesses(params: LeadSearchParams): Promise<BusinessLeadSeed[]>;
  getBusinessDetails(placeId: string): Promise<BusinessLeadDetails | null>;
}

// Email Extractor Provider
export interface PublicEmailResult {
  email: string | null;
  source: string | null; // URL where email was found
  confidence: 'high' | 'medium' | 'low' | null;
  foundAt: Date;
}

export interface EmailExtractorProvider {
  name: string;
  extractPublicEmails(websiteUrl: string): Promise<PublicEmailResult>;
}

// Provider configuration
export interface ProviderConfig {
  domain: {
    provider: 'dynadot' | 'mock';
    apiKey?: string;
  };
  leads: {
    provider: 'google-places' | 'mock';
    apiKey?: string;
  };
  email: {
    provider: 'website-scraper' | 'mock';
  };
  demoMode: boolean;
}

// Provider errors
export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class RateLimitError extends ProviderError {
  constructor(provider: string, retryAfter?: number) {
    super(`Rate limit exceeded for ${provider}`, provider);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
  retryAfter?: number;
}
