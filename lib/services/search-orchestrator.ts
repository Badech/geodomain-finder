/**
 * Search Orchestration Service
 * Coordinates the entire search workflow from input to persisted results
 */

import { generateDomainCandidates, DomainCandidate } from './domain-generator';
import { 
  scoreBusinessLeads, 
  matchDomainsToBusinesses, 
  BusinessLead,
  ScoredBusinessLead,
  DomainBusinessMatch 
} from './business-matcher';
import { DomainProvider } from '../providers/types';
import { LeadProvider } from '../providers/types';
import { EmailExtractorProvider } from '../providers/types';

export interface SearchInput {
  niche: string;
  city: string;
  state: string;
  modifiers?: string[];
  maxDomains?: number;
  maxBusinesses?: number;
}

export interface SearchProgress {
  stage: 'validating' | 'generating' | 'checking' | 'searching' | 'enriching' | 'matching' | 'persisting' | 'complete';
  message: string;
  progress: number; // 0-100
}

export interface DomainOpportunity {
  domain: string;
  tld: string;
  status: 'available' | 'taken' | 'unknown';
  qualityScore: number;
  seoScore: number;
  resaleScore: number;
  reasons: string[];
}

export interface EnrichedBusinessLead extends ScoredBusinessLead {
  emailEnrichment?: {
    email: string | null;
    source: string | null;
    confidence: 'high' | 'medium' | 'low' | null;
  };
}

export interface SearchResult {
  searchQueryId: string;
  domains: DomainOpportunity[];
  businesses: EnrichedBusinessLead[];
  matches: DomainBusinessMatch[];
  metadata: {
    totalDomains: number;
    availableDomains: number;
    totalBusinesses: number;
    totalMatches: number;
    executionTime: number;
  };
}

export type ProgressCallback = (progress: SearchProgress) => void;

/**
 * Main search orchestration class
 */
export class SearchOrchestrator {
  constructor(
    private domainProvider: DomainProvider,
    private leadProvider: LeadProvider,
    private emailExtractor: EmailExtractorProvider
  ) {}

  /**
   * Execute complete search workflow
   */
  async executeSearch(
    input: SearchInput,
    onProgress?: ProgressCallback
  ): Promise<SearchResult> {
    const startTime = Date.now();
    const searchQueryId = this.generateSearchId();

    try {
      // Stage 1: Validate input
      this.reportProgress(onProgress, 'validating', 'Validating search parameters...', 5);
      this.validateInput(input);

      // Stage 2: Generate domain candidates
      this.reportProgress(onProgress, 'generating', 'Generating domain suggestions...', 15);
      const domainCandidates = generateDomainCandidates({
        niche: input.niche,
        city: input.city,
        state: input.state,
        modifiers: input.modifiers,
        maxResults: input.maxDomains || 20,
      });

      // Stage 3: Check domain availability (parallel)
      this.reportProgress(onProgress, 'checking', 'Checking domain availability...', 30);
      const domains = await this.checkDomainAvailability(domainCandidates);

      // Stage 4: Search for businesses
      this.reportProgress(onProgress, 'searching', 'Searching for businesses...', 50);
      const businesses = await this.searchBusinesses(input);

      // Stage 5: Score businesses
      this.reportProgress(onProgress, 'searching', 'Analyzing businesses...', 60);
      const scoredBusinesses = scoreBusinessLeads(businesses);

      // Stage 6: Enrich business data with emails (rate-limited)
      this.reportProgress(onProgress, 'enriching', 'Enriching business data...', 70);
      const enrichedBusinesses = await this.enrichBusinessData(scoredBusinesses);

      // Stage 7: Match domains to businesses
      this.reportProgress(onProgress, 'matching', 'Matching domains to businesses...', 85);
      const matches = matchDomainsToBusinesses(
        domainCandidates.filter(d => 
          domains.find(dom => dom.domain === d.domain)?.status === 'available'
        ),
        enrichedBusinesses
      );

      // Stage 8: Complete
      this.reportProgress(onProgress, 'complete', 'Search complete!', 100);

      const executionTime = Date.now() - startTime;

      return {
        searchQueryId,
        domains,
        businesses: enrichedBusinesses,
        matches,
        metadata: {
          totalDomains: domains.length,
          availableDomains: domains.filter(d => d.status === 'available').length,
          totalBusinesses: enrichedBusinesses.length,
          totalMatches: matches.length,
          executionTime,
        },
      };
    } catch (error) {
      this.reportProgress(onProgress, 'complete', 'Search failed', 0);
      throw error;
    }
  }

  /**
   * Validate search input
   */
  private validateInput(input: SearchInput): void {
    if (!input.niche || input.niche.trim().length === 0) {
      throw new Error('Niche is required');
    }
    if (!input.city || input.city.trim().length === 0) {
      throw new Error('City is required');
    }
    if (!input.state || input.state.trim().length === 0) {
      throw new Error('State is required');
    }
    if (input.niche.length > 100) {
      throw new Error('Niche too long (max 100 characters)');
    }
    if (input.city.length > 100) {
      throw new Error('City name too long (max 100 characters)');
    }
    if (input.state.length > 50) {
      throw new Error('State name too long (max 50 characters)');
    }
  }

  /**
   * Check availability for domain candidates
   */
  private async checkDomainAvailability(
    candidates: DomainCandidate[]
  ): Promise<DomainOpportunity[]> {
    const domainStrings = candidates.map(c => c.domain);
    
    try {
      const results = await this.domainProvider.checkAvailability(domainStrings);
      
      return candidates.map(candidate => {
        const availabilityResult = results.find(r => r.domain === candidate.domain);
        
        return {
          domain: candidate.domain,
          tld: '.com',
          status: availabilityResult?.status || 'unknown',
          qualityScore: candidate.qualityScore,
          seoScore: candidate.seoScore,
          resaleScore: candidate.resaleScore,
          reasons: candidate.reasons,
        };
      });
    } catch (error) {
      // On error, mark all as unknown
      console.error('Domain availability check failed:', error);
      return candidates.map(candidate => ({
        domain: candidate.domain,
        tld: '.com',
        status: 'unknown' as const,
        qualityScore: candidate.qualityScore,
        seoScore: candidate.seoScore,
        resaleScore: candidate.resaleScore,
        reasons: candidate.reasons,
      }));
    }
  }

  /**
   * Search for businesses using lead provider
   */
  private async searchBusinesses(input: SearchInput): Promise<BusinessLead[]> {
    try {
      const leads = await this.leadProvider.searchBusinesses({
        niche: input.niche,
        city: input.city,
        state: input.state,
        maxResults: input.maxBusinesses || 20,
      });

      return leads.map(lead => ({
        id: lead.placeId || `generated_${Date.now()}_${Math.random()}`,
        placeId: lead.placeId,
        name: lead.name,
        niche: input.niche,
        city: lead.city,
        state: lead.state,
        phone: lead.phone,
        email: undefined,
        website: lead.website,
        address: lead.address,
        rating: lead.rating || 0,
        reviewCount: lead.reviewCount || 0,
        currentDomain: lead.website,
        status: 'new',
        tags: [],
      }));
    } catch (error) {
      console.error('Business search failed:', error);
      return []; // Return empty array on failure
    }
  }

  /**
   * Enrich business data with email extraction
   */
  private async enrichBusinessData(
    businesses: ScoredBusinessLead[]
  ): Promise<EnrichedBusinessLead[]> {
    const enriched: EnrichedBusinessLead[] = [];
    
    for (const business of businesses) {
      const enrichedBusiness: EnrichedBusinessLead = { ...business };
      
      // Only attempt email extraction if business has a website
      if (business.website) {
        try {
          const emailResult = await this.emailExtractor.extractPublicEmails(business.website);
          
          enrichedBusiness.emailEnrichment = {
            email: emailResult.email,
            source: emailResult.source,
            confidence: emailResult.confidence,
          };
          
          // Update email field if found
          if (emailResult.email) {
            enrichedBusiness.email = emailResult.email;
          }
          
          // Small delay between requests to be respectful
          await this.delay(300);
        } catch (error) {
          console.error(`Email extraction failed for ${business.name}:`, error);
          // Continue without email enrichment
        }
      }
      
      enriched.push(enrichedBusiness);
    }
    
    return enriched;
  }

  /**
   * Report progress to callback
   */
  protected reportProgress(
    callback: ProgressCallback | undefined,
    stage: SearchProgress['stage'],
    message: string,
    progress: number
  ): void {
    if (callback) {
      callback({ stage, message, progress });
    }
  }

  /**
   * Generate unique search ID
   */
  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Execute a search with caching support
 */
export class CachedSearchOrchestrator extends SearchOrchestrator {
  private cache: Map<string, { result: SearchResult; timestamp: number }> = new Map();
  private cacheTTL = 60 * 60 * 1000; // 1 hour

  async executeSearch(
    input: SearchInput,
    onProgress?: ProgressCallback
  ): Promise<SearchResult> {
    const cacheKey = this.getCacheKey(input);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      // Return cached result
      this.reportProgress(onProgress, 'complete', 'Loaded from cache', 100);
      return cached.result;
    }

    // Execute fresh search
    const result = await super.executeSearch(input, onProgress);

    // Cache the result
    this.cache.set(cacheKey, { result, timestamp: Date.now() });

    return result;
  }

  private getCacheKey(input: SearchInput): string {
    return `${input.niche}|${input.city}|${input.state}|${input.modifiers?.join(',') || ''}`;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }

}
