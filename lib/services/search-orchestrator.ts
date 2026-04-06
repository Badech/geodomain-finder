/**
 * Search Orchestration Service
 * Coordinates the entire search workflow from input to persisted results
 */

import { generateDomainCandidates, DomainCandidate } from './domain-generator';

// Re-export for use in API routes
export { generateDomainCandidates } from './domain-generator';
export { scoreBusinessLeads } from './business-matcher';
export type { DomainCandidate } from './domain-generator';
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
  domainGenerationMode?: 'standard' | 'expanded' | 'exhaustive';
  initialDomainBatch?: number; // Number of domains to check immediately (default: 30)
  initialBusinessBatch?: number; // Number of businesses to enrich immediately (default: 20)
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
    totalGenerated?: number; // Total domains generated
    domainsChecked?: number; // Domains checked for availability
    domainsUnchecked?: number; // Domains not yet checked
    businessesFound?: number; // Total businesses found
    businessesEnriched?: number; // Businesses enriched
    businessesUnenriched?: number; // Businesses not yet enriched
  };
  unenrichedBusinesses?: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    rating: number;
    buyerScore: number;
  }>;
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

      // Stage 2: Generate domain candidates (NO LIMIT)
      this.reportProgress(onProgress, 'generating', 'Generating domain suggestions...', 15);
      const allDomainCandidates = generateDomainCandidates({
        niche: input.niche,
        city: input.city,
        state: input.state,
        modifiers: input.modifiers,
        mode: input.domainGenerationMode || 'expanded', // Default to expanded mode
        initialBatchSize: input.initialDomainBatch || 30,
      });
      
      console.log(`[Search] 📊 Generated ${allDomainCandidates.length} total domain candidates`);
      
      // Split into batches for progressive availability checking
      const initialBatchSize = input.initialDomainBatch || 30;
      const domainCandidates = allDomainCandidates.slice(0, initialBatchSize);
      const remainingCandidates = allDomainCandidates.slice(initialBatchSize);
      
      console.log(`[Search] ⚡ Checking first ${domainCandidates.length} domains immediately`);
      if (remainingCandidates.length > 0) {
        console.log(`[Search] 📦 ${remainingCandidates.length} additional candidates available for later batches`);
      }

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

      console.log(`[Search] 📊 Found ${scoredBusinesses.length} businesses total`);

      // Stage 6: Progressive enrichment - enrich initial batch, keep rest for later
      this.reportProgress(onProgress, 'enriching', 'Enriching top prospects...', 70);
      
      const initialBusinessBatch = input.initialBusinessBatch || 20;
      const businessesToEnrich = scoredBusinesses.slice(0, initialBusinessBatch);
      const remainingBusinesses = scoredBusinesses.slice(initialBusinessBatch);
      
      console.log(`[Search] ⚡ Enriching first ${businessesToEnrich.length} businesses immediately`);
      if (remainingBusinesses.length > 0) {
        console.log(`[Search] 📦 ${remainingBusinesses.length} additional businesses available for later enrichment`);
      }
      
      const enrichedBatch = await this.enrichBusinessData(businessesToEnrich);
      
      // Normalize remaining businesses with proper fallbacks
      const normalizedRemaining = remainingBusinesses.map(b => this.normalizeBusinessLead(b));
      
      // Combine enriched and unenriched (with fallbacks)
      const enrichedBusinesses = [
        ...enrichedBatch,
        ...normalizedRemaining
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

      // Log enhanced performance summary
      const availableCount = domains.filter(d => d.status === 'available').length;
      const takenCount = domains.filter(d => d.status === 'taken').length;
      const premiumCount = domains.filter(d => d.status === 'premium').length;
      
      console.log(`\n[Search] ✅ Search complete in ${(executionTime / 1000).toFixed(1)}s`);
      console.log(`[Search] 📊 Domain Generation:`);
      console.log(`[Search]    - Total generated: ${allDomainCandidates.length}`);
      console.log(`[Search]    - Checked for availability: ${domainCandidates.length}`);
      console.log(`[Search]    - Unchecked (available for load-more): ${remainingCandidates.length}`);
      console.log(`[Search] 🎯 Domain Availability:`);
      console.log(`[Search]    - Available: ${availableCount}/${domains.length}`);
      console.log(`[Search]    - Taken: ${takenCount}/${domains.length}`);
      console.log(`[Search]    - Premium: ${premiumCount}/${domains.length}`);
      console.log(`[Search] 🏢 Business Results:`);
      console.log(`[Search]    - Total found: ${scoredBusinesses.length}`);
      console.log(`[Search]    - Enriched: ${businessesToEnrich.length}`);
      console.log(`[Search]    - Unenriched (available for load-more): ${remainingBusinesses.length}`);
      console.log(`[Search]    - With email: ${enrichedBusinesses.filter(b => b.email && b.email !== 'Unavailable').length}/${enrichedBusinesses.length}`);
      console.log(`[Search]    - Matches found: ${matches.length}`);

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
          totalGenerated: allDomainCandidates.length,
          domainsChecked: domainCandidates.length,
          domainsUnchecked: remainingCandidates.length,
          businessesFound: scoredBusinesses.length,
          businessesEnriched: businessesToEnrich.length,
          businessesUnenriched: remainingBusinesses.length,
        },
        // Include unchecked candidates for potential pagination/load-more
        // uncheckedDomains: remainingCandidates.map(c => ({
        //   domain: c.domain,
        //   qualityScore: c.qualityScore,
        //   pattern: c.pattern,
        // })),
        // Include unenriched businesses for potential progressive enrichment
        // unenrichedBusinesses: remainingBusinesses.map(b => ({
        //   id: b.id,
        //   name: b.name,
        //   city: b.city,
        //   state: b.state,
        //   rating: b.rating,
        //   buyerScore: b.buyerScore || 50,
        // })),
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
    const startTime = Date.now();
    const domainStrings = candidates.map(c => c.domain);
    
    console.log(`[Availability] Checking ${domainStrings.length} domains...`);
    
    try {
      const results = await this.domainProvider.checkAvailability(domainStrings);
      
      const checkTime = Date.now() - startTime;
      const available = results.filter(r => r.status === 'available').length;
      const taken = results.filter(r => r.status === 'taken').length;
      const errors = results.filter(r => r.status === 'error').length;
      
      console.log(`[Availability] ✅ Completed in ${(checkTime / 1000).toFixed(1)}s: ${available} available, ${taken} taken, ${errors} errors`);
      
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
    const startTime = Date.now();
    console.log(`[BusinessSearch] Searching: ${input.niche} in ${input.city}, ${input.state}`);
    
    try {
      // Remove hard limit - get as many businesses as provider returns
      const leads = await this.leadProvider.searchBusinesses({
        niche: input.niche,
        city: input.city,
        state: input.state,
        maxResults: 60, // Increased from 20 to get more comprehensive results
      });

      return leads.map(lead => ({
        id: lead.placeId || `generated_${Date.now()}_${Math.random()}`,
        placeId: lead.placeId,
        name: lead.name,
        niche: input.niche,
        city: lead.city,
        state: lead.state,
        phone: lead.phone,
        email: lead.email, // Keep email if provided by the lead provider
        website: lead.website,
        address: lead.address,
        rating: lead.rating || 0,
        reviewCount: lead.reviewCount || 0,
        currentDomain: lead.website,
        status: 'new',
        tags: [],
        // Phase 3: Include coordinates if available
        latitude: lead.latitude,
        longitude: lead.longitude,
      }));
      
      const searchTime = Date.now() - startTime;
      console.log(`[BusinessSearch] ✅ Found ${leads.length} businesses in ${(searchTime / 1000).toFixed(1)}s`);
      
      // Convert BusinessLeadSeed to BusinessLead
      return leads.map(lead => ({
        id: lead.placeId || `generated_${Date.now()}_${Math.random()}`,
        placeId: lead.placeId,
        name: lead.name,
        niche: input.niche,
        city: lead.city,
        state: lead.state,
        phone: lead.phone,
        email: lead.email,
        website: lead.website,
        address: lead.address,
        rating: lead.rating || 0,
        reviewCount: lead.reviewCount || 0,
        currentDomain: lead.website,
        status: 'new' as const,
        tags: [],
        latitude: lead.latitude,
        longitude: lead.longitude,
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
    const startTime = Date.now();
    const CONCURRENCY_LIMIT = 5; // Process 5 businesses at a time
    const TIMEOUT_PER_BUSINESS = 8000; // 8 seconds max per business
    const enriched: EnrichedBusinessLead[] = [];
    
    const withWebsite = businesses.filter(b => b.website);
    const withoutWebsite = businesses.filter(b => !b.website);
    
    console.log(`[Enrichment] Starting enrichment for ${withWebsite.length}/${businesses.length} businesses with websites`);
    
    // Process in batches for better performance with timeout
    for (let i = 0; i < businesses.length; i += CONCURRENCY_LIMIT) {
      const batch = businesses.slice(i, i + CONCURRENCY_LIMIT);
      
      const batchResults = await Promise.all(
        batch.map(business => 
          this.enrichSingleBusinessWithTimeout(business, TIMEOUT_PER_BUSINESS)
        )
      );
      
      enriched.push(...batchResults);
    }
    
    const enrichmentTime = Date.now() - startTime;
    const enrichedCount = enriched.filter(b => b.email).length;
    console.log(`[Enrichment] ✅ Completed in ${(enrichmentTime / 1000).toFixed(1)}s: Found emails for ${enrichedCount}/${withWebsite.length} businesses`);
    
    return enriched;
  }

  /**
   * Normalize business lead with proper fallbacks
   * Ensures no fields appear blank or broken in UI
   */
  private normalizeBusinessLead(business: ScoredBusinessLead): EnrichedBusinessLead {
    return {
      ...business,
      email: business.email || 'Unavailable',
      website: business.website || 'Unavailable',
      // recommendedDomain: business.recommendedDomain || 'Not assigned yet',
      // alternativeDomains: business.alternativeDomains || [],
      // fitScore: business.fitScore || 0,
      // fitReasons: business.fitReasons || [],
      status: business.status || 'new',
    };
  }

  /**
   * Enrich a single business with timeout protection
   */
  private async enrichSingleBusinessWithTimeout(
    business: ScoredBusinessLead,
    timeoutMs: number
  ): Promise<EnrichedBusinessLead> {
    const enrichmentPromise = this.enrichSingleBusiness(business);
    const timeoutPromise = new Promise<EnrichedBusinessLead>((resolve) => {
      setTimeout(() => {
        console.warn(`[Enrichment] ⏱️ Timeout for ${business.name} after ${timeoutMs}ms`);
        resolve({ ...business } as EnrichedBusinessLead);
      }, timeoutMs);
    });

    return Promise.race([enrichmentPromise, timeoutPromise]);
  }

  /**
   * PHASE 4: Enriches a single business with email and website audit
   */
  private async enrichSingleBusiness(business: ScoredBusinessLead): Promise<EnrichedBusinessLead> {
    const enrichedBusiness: EnrichedBusinessLead = { 
      ...business,
      // Set fallback values for fields that might not be enriched
      email: business.email || 'Unavailable',
      website: business.website || 'Unavailable',
      // recommendedDomain: business.recommendedDomain || 'Not assigned yet',
      // alternativeDomains: business.alternativeDomains || [],
      // fitScore: business.fitScore || 0,
      // fitReasons: business.fitReasons || [],
      status: business.status || 'new',
    };
    
    // Only attempt enrichment if business has a website
    if (!business.website || business.website === 'Unavailable') {
      return enrichedBusiness;
    }

    try {
      // Run email extraction and website audit in parallel with individual timeouts
      const EMAIL_TIMEOUT = 6000; // 6 seconds for email
      const AUDIT_TIMEOUT = 5000; // 5 seconds for audit
      
      const [emailResult, auditResult] = await Promise.allSettled([
        Promise.race([
          this.emailExtractor.extractPublicEmails(business.website),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Email timeout')), EMAIL_TIMEOUT))
        ]),
        Promise.race([
          this.auditWebsiteIfAvailable(business),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Audit timeout')), AUDIT_TIMEOUT))
        ]),
      ]);

      // Process email result
      if (emailResult.status === 'fulfilled' && emailResult.value) {
        const emailValue = emailResult.value as any;
        enrichedBusiness.emailEnrichment = {
          email: emailValue.email,
          source: emailValue.source,
          confidence: emailValue.confidence,
          classification: emailValue.classification,
          sourceType: emailValue.sourceType,
        };
        
        // Only update email if actually found, otherwise keep "Unavailable"
        if (emailValue.email) {
          enrichedBusiness.email = emailValue.email;
        }
      }

      // Process audit result
      if (auditResult.status === 'fulfilled' && auditResult.value) {
        enrichedBusiness.websiteAudit = auditResult.value;
      }
    } catch (error) {
      // Silent fail - continue with fallback values
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
