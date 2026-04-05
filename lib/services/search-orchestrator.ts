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
import { 
  analyzeProspect, 
  getTopBuyers, 
  ProspectAnalysis 
} from './prospect-scoring';
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
  status: 'available' | 'taken' | 'premium' | 'invalid' | 'error' | 'unknown';
  qualityScore: number;
  seoScore: number;
  resaleScore: number;
  naturalnessScore?: number;
  reasons: string[];
  pattern?: string;
  availabilityCheckedAt?: Date;
  availabilitySource?: string;
  providerResponseCode?: number;
}

export interface EnrichedBusinessLead extends ScoredBusinessLead {
  emailEnrichment?: {
    email: string | null;
    source: string | null;
    confidence: 'high' | 'medium' | 'low' | null;
    classification?: 'role-based' | 'personal' | 'free-provider' | 'undeliverable';
    sourceType?: 'mailto' | 'contact-page' | 'about-page' | 'homepage' | 'footer';
  };
  // Phase 1 enhancements from matching
  recommendedDomain?: string;
  alternativeDomains?: string[];
  fitScore?: number;
  fitReasons?: string[];
  currentDomainAnalysis?: {
    domain: string;
    weaknesses: string[];
    strengths: string[];
    overallScore: number;
  };
  // Phase 2 enhancements
  websiteAudit?: {
    score: number;
    signals: {
      hasHttps: boolean;
      domainLength: number;
      hasGeoKeyword: boolean;
      hasServiceKeyword: boolean;
      isGeneric: boolean;
      isBranded: boolean;
      possiblePlatform?: string;
      possibleAge?: string;
    };
    insights: string[];
  };
  // Phase 6 enhancements - Prospect Scoring
  topBuyerScore?: number;
  contactReadinessScore?: number;
  ranking?: 'platinum' | 'gold' | 'silver' | 'bronze' | 'standard';
  topBuyerReasons?: string[];
  contactReadinessReasons?: string[];
  recommendedAction?: 'immediate' | 'priority' | 'follow-up' | 'monitor';
  pitchAngles?: string[];
}

export interface SearchResult {
  searchQueryId: string;
  domains: DomainOpportunity[];
  businesses: EnrichedBusinessLead[];
  matches: DomainBusinessMatch[];
  topBuyers?: ProspectAnalysis[]; // Phase 6: Top 10 best prospects
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

      // Stage 3 & 4: Check domains AND search businesses IN PARALLEL (Phase 4 optimization)
      this.reportProgress(onProgress, 'checking', 'Checking domain availability...', 30);
      
      // Run domain availability and business search concurrently for speed
      const [domains, businesses] = await Promise.all([
        this.checkDomainAvailability(domainCandidates),
        this.searchBusinesses(input),
      ]);
      
      this.reportProgress(onProgress, 'searching', 'Processing results...', 50);

      // Stage 5: Score businesses
      this.reportProgress(onProgress, 'searching', 'Analyzing businesses...', 60);
      const scoredBusinesses = scoreBusinessLeads(businesses);

      // Stage 6: Enrich ONLY top businesses (Phase 4 optimization - smart enrichment)
      this.reportProgress(onProgress, 'enriching', 'Enriching top prospects...', 70);
      
      // Only enrich top 10 businesses to speed up initial results
      const topBusinesses = scoredBusinesses.slice(0, 10);
      const remainingBusinesses = scoredBusinesses.slice(10);
      
      const enrichedTop = await this.enrichBusinessData(topBusinesses);
      
      // Remaining businesses stay unenriched (can be enriched on demand later)
      const enrichedBusinesses = [
        ...enrichedTop,
        ...remainingBusinesses.map(b => ({ ...b } as EnrichedBusinessLead))
      ];

      // Stage 7: Match domains to businesses
      this.reportProgress(onProgress, 'matching', 'Matching domains to businesses...', 85);
      const matches = matchDomainsToBusinesses(
        domainCandidates.filter(d => 
          domains.find(dom => dom.domain === d.domain)?.status === 'available'
        ),
        enrichedBusinesses
      );

      // Enrich businesses with match data
      for (const business of enrichedBusinesses) {
        const match = matches.find(m => m.businessLeadId === business.id);
        if (match) {
          business.recommendedDomain = match.domain;
          business.alternativeDomains = match.alternativeDomains;
          business.fitScore = match.fitScore;
          business.fitReasons = match.reasons;
          business.currentDomainAnalysis = match.currentDomainAnalysis;
        }
      }

      // Phase 6: Analyze prospects and add scoring
      this.reportProgress(onProgress, 'matching', 'Analyzing top prospects...', 90);
      const prospectAnalyses: ProspectAnalysis[] = enrichedBusinesses.map(business => 
        analyzeProspect(business, business.currentDomainAnalysis)
      );

      // Add prospect scores to businesses
      for (let i = 0; i < enrichedBusinesses.length; i++) {
        const business = enrichedBusinesses[i];
        const analysis = prospectAnalyses[i];
        
        business.topBuyerScore = analysis.topBuyerScore;
        business.contactReadinessScore = analysis.contactReadinessScore;
        business.ranking = analysis.ranking;
        business.topBuyerReasons = analysis.topBuyerReasons;
        business.contactReadinessReasons = analysis.contactReadinessReasons;
        business.recommendedAction = analysis.recommendedAction;
        business.pitchAngles = analysis.pitchAngles;
      }

      // Get top 10 buyers for quick reference
      const topBuyers = getTopBuyers(prospectAnalyses, 10);

      // Stage 8: Complete
      this.reportProgress(onProgress, 'complete', 'Search complete!', 100);

      const executionTime = Date.now() - startTime;

      return {
        searchQueryId,
        domains,
        businesses: enrichedBusinesses,
        matches,
        topBuyers,
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
          status: availabilityResult?.status || 'error',
          qualityScore: candidate.qualityScore,
          seoScore: candidate.seoScore,
          resaleScore: candidate.resaleScore,
          naturalnessScore: candidate.naturalnessScore,
          reasons: candidate.reasons,
          pattern: candidate.pattern,
          availabilityCheckedAt: availabilityResult?.checkedAt,
          availabilitySource: availabilityResult?.availabilitySource,
          providerResponseCode: availabilityResult?.providerResponseCode,
        };
      });
    } catch (error) {
      // On complete provider failure, mark domains with error status
      console.error('Domain availability check failed completely:', error);
      return candidates.map(candidate => ({
        domain: candidate.domain,
        tld: '.com',
        status: 'error' as const,
        qualityScore: candidate.qualityScore,
        seoScore: candidate.seoScore,
        resaleScore: candidate.resaleScore,
        naturalnessScore: candidate.naturalnessScore,
        reasons: candidate.reasons,
        pattern: candidate.pattern,
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
  /**
   * PHASE 4 OPTIMIZATION: Parallel enrichment with concurrency control
   * Enriches businesses in parallel batches instead of sequential
   */
  private async enrichBusinessData(
    businesses: ScoredBusinessLead[]
  ): Promise<EnrichedBusinessLead[]> {
    const CONCURRENCY_LIMIT = 5; // Process 5 businesses at a time
    const enriched: EnrichedBusinessLead[] = [];
    
    // Process in batches for better performance
    for (let i = 0; i < businesses.length; i += CONCURRENCY_LIMIT) {
      const batch = businesses.slice(i, i + CONCURRENCY_LIMIT);
      
      const batchResults = await Promise.all(
        batch.map(business => this.enrichSingleBusiness(business))
      );
      
      enriched.push(...batchResults);
    }
    
    return enriched;
  }

  /**
   * PHASE 4: Enriches a single business with email and website audit
   */
  private async enrichSingleBusiness(business: ScoredBusinessLead): Promise<EnrichedBusinessLead> {
    const enrichedBusiness: EnrichedBusinessLead = { ...business };
    
    // Only attempt enrichment if business has a website
    if (!business.website) {
      return enrichedBusiness;
    }

    try {
      // Run email extraction and website audit in parallel
      const [emailResult, auditResult] = await Promise.allSettled([
        this.emailExtractor.extractPublicEmails(business.website),
        this.auditWebsiteIfAvailable(business),
      ]);

      // Process email result
      if (emailResult.status === 'fulfilled') {
        enrichedBusiness.emailEnrichment = {
          email: emailResult.value.email,
          source: emailResult.value.source,
          confidence: emailResult.value.confidence,
          classification: emailResult.value.classification,
          sourceType: emailResult.value.sourceType,
        };
        
        if (emailResult.value.email) {
          enrichedBusiness.email = emailResult.value.email;
        }
      }

      // Process audit result
      if (auditResult.status === 'fulfilled' && auditResult.value) {
        enrichedBusiness.websiteAudit = auditResult.value;
      }
    } catch (error) {
      console.error(`Enrichment failed for ${business.name}:`, error);
      // Continue without enrichment
    }
    
    return enrichedBusiness;
  }

  /**
   * PHASE 4: Helper to audit website with proper error handling
   */
  private async auditWebsiteIfAvailable(business: ScoredBusinessLead): Promise<any | null> {
    try {
      const { auditWebsite, generateAuditInsights } = await import('./website-audit');
      const auditResult = await auditWebsite(business.website!, {
        city: business.city,
        state: business.state,
        niche: business.niche,
        businessName: business.name,
      });
      
      return {
        score: auditResult.score,
        signals: {
          hasHttps: auditResult.signals.hasHttps,
          domainLength: auditResult.signals.domainLength,
          hasGeoKeyword: auditResult.signals.hasGeoKeyword,
          hasServiceKeyword: auditResult.signals.hasServiceKeyword,
          isGeneric: auditResult.signals.isGeneric,
          isBranded: auditResult.signals.isBranded,
          possiblePlatform: auditResult.signals.possiblePlatform,
          possibleAge: auditResult.signals.possibleAge,
        },
        insights: generateAuditInsights(auditResult, {
          city: business.city,
          state: business.state,
          niche: business.niche,
          businessName: business.name,
        }),
      };
    } catch (error) {
      console.error(`Website audit failed for ${business.name}:`, error);
      return null;
    }
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
