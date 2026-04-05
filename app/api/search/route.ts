/**
 * Search API Route
 * POST /api/search - Execute complete domain and lead search
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { SearchOrchestrator } from '../../../lib/services/search-orchestrator';
import { initializeProviders } from '../../../lib/providers/config';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  parseRequestBody,
  withErrorHandling,
  logRequest,
  logResponse 
} from '../../../lib/api/utils';
import { db } from '../../../lib/db';
import { searchRateLimiter, getClientIdentifier, createRateLimitResponse } from '../../../lib/api/rate-limit';
import { globalSearchCache } from '../../../lib/cache/search-cache';

// Request validation schema with sanitization
const searchRequestSchema = z.object({
  niche: z.string()
    .min(1, 'Niche is required')
    .max(100, 'Niche must be less than 100 characters')
    .trim()
    .transform(val => val.toLowerCase()),
  city: z.string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .trim(),
  state: z.string()
    .min(1, 'State is required')
    .max(50, 'State must be less than 50 characters')
    .trim(),
  modifiers: z.array(z.string().max(50))
    .optional()
    .transform(val => val?.slice(0, 10)), // Max 10 modifiers
  maxDomains: z.number()
    .min(1, 'Must generate at least 1 domain')
    .max(50, 'Cannot generate more than 50 domains')
    .optional()
    .default(20),
  maxBusinesses: z.number()
    .min(1, 'Must search for at least 1 business')
    .max(30, 'Cannot search for more than 30 businesses')
    .optional()
    .default(20),
});

type SearchRequest = z.infer<typeof searchRequestSchema>;

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  if (searchRateLimiter.isRateLimited(clientId)) {
    const resetTime = searchRateLimiter.getResetTime(clientId);
    return createRateLimitResponse(resetTime);
  }
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    // Parse and validate request
    const body = await parseRequestBody<SearchRequest>(request, searchRequestSchema);
    logRequest('POST', '/api/search', body);

    // PHASE 4: Check cache first for faster responses
    const cachedResult = globalSearchCache.get({
      niche: body.niche,
      city: body.city,
      state: body.state,
      modifiers: body.modifiers,
    });

    if (cachedResult) {
      console.log('✅ Returning cached search result');
      const duration = Date.now() - startTime;
      logResponse('POST', '/api/search', 200, duration);
      
      return createSuccessResponse({
        ...cachedResult,
        businesses: cachedResult.businesses.map(b => ({
          id: b.id,
          name: b.name,
          niche: body.niche,
          city: b.city,
          state: b.state,
          phone: b.phone,
          email: b.email,
          website: b.website,
          address: b.address,
          rating: b.rating,
          reviewCount: b.reviewCount,
          currentDomain: b.currentDomain,
          buyerScore: b.buyerScore,
          status: 'new',
          tags: b.tags || [],
        })),
        metadata: {
          ...cachedResult.metadata,
          cached: true,
          cacheHit: true,
        },
      });
    }

    // PHASE 4: Apply request limits for smart enrichment
    const maxDomains = Math.min(body.maxDomains || 20, 30); // Cap at 30
    const maxBusinesses = Math.min(body.maxBusinesses || 20, 30); // Cap at 30

    // Initialize providers and orchestrator
    const { domainProvider, leadProvider, emailExtractor } = initializeProviders();
    const orchestrator = new SearchOrchestrator(domainProvider, leadProvider, emailExtractor);

    // Execute search
    const result = await orchestrator.executeSearch({
      niche: body.niche,
      city: body.city,
      state: body.state,
      modifiers: body.modifiers,
      maxDomains,
      maxBusinesses,
    });

    // PHASE 4: Cache the result
    globalSearchCache.set({
      niche: body.niche,
      city: body.city,
      state: body.state,
      modifiers: body.modifiers,
    }, result);

    // PHASE 4 OPTIMIZATION: Persist to database in background (non-blocking)
    // Don't wait for database writes - return results immediately
    persistSearchResultsInBackground(body, result).catch(error => {
      console.error('Background persistence failed:', error);
      // Log but don't fail the request
    });

    // Return response immediately for faster UI updates
    const duration = Date.now() - startTime;
    logResponse('POST', '/api/search', 200, duration);

    return createSuccessResponse({
      searchQueryId: result.searchQueryId,
      domains: result.domains,
      businesses: result.businesses.map(b => ({
        id: b.id,
        name: b.name,
        niche: body.niche,
        city: b.city,
        state: b.state,
        phone: b.phone,
        email: b.email,
        website: b.website,
        address: b.address,
        rating: b.rating,
        reviewCount: b.reviewCount,
        currentDomain: b.currentDomain,
        buyerScore: b.buyerScore,
        status: 'new',
        tags: b.tags || [],
      })),
      matches: result.matches,
      metadata: {
        ...result.metadata,
        persistedAt: new Date().toISOString(),
        cached: false,
      },
    });
  });
}

/**
 * PHASE 4: Background persistence - doesn't block API response
 * Persists search results to database asynchronously
 */
async function persistSearchResultsInBackground(
  body: SearchRequest,
  result: any
): Promise<void> {
  try {
    // Persist search query to database
    const searchQuery = await db.searchQuery.create({
      data: {
        niche: body.niche,
        city: body.city,
        state: body.state,
        modifiers: body.modifiers || [],
      },
    });

    // Persist domains to database
    const domainPromises = result.domains.map((domain: any) =>
      db.domainOpportunity.upsert({
        where: { domain: domain.domain },
        create: {
          domain: domain.domain,
          tld: domain.tld,
          status: domain.status,
          qualityScore: domain.qualityScore,
          seoScore: domain.seoScore,
          resaleScore: domain.resaleScore,
          reasons: domain.reasons,
          searchQueryId: searchQuery.id,
        },
        update: {
          status: domain.status,
          qualityScore: domain.qualityScore,
          seoScore: domain.seoScore,
          resaleScore: domain.resaleScore,
          reasons: domain.reasons,
        },
      })
    );

    const savedDomains = await Promise.all(domainPromises);

    // Persist business leads to database
    const businessPromises = result.businesses.map((business: any) =>
      db.businessLead.upsert({
        where: { placeId: business.id },
        create: {
          placeId: business.id,
          name: business.name,
          niche: body.niche,
          city: business.city,
          state: business.state,
          phone: business.phone,
          email: business.email,
          website: business.website,
          address: business.address,
          rating: business.rating,
          reviewCount: business.reviewCount,
          currentDomain: business.currentDomain,
          buyerScore: business.buyerScore,
          tags: business.tags || [],
          notes: business.scoreReasons?.join('\n') || '',
        },
        update: {
          rating: business.rating,
          reviewCount: business.reviewCount,
          buyerScore: business.buyerScore,
          email: business.email || undefined,
        },
      })
    );

    const savedBusinesses = await Promise.all(businessPromises);

    // Persist matches to database
    const matchPromises = result.matches.map(async (match: any) => {
      const domain = savedDomains.find(d => d.domain === match.domain);
      const business = savedBusinesses.find(b => b.placeId === match.businessLeadId);

      if (domain && business) {
        return db.opportunityMatch.upsert({
          where: {
            businessLeadId_domainOpportunityId: {
              businessLeadId: business.id,
              domainOpportunityId: domain.id,
            },
          },
          create: {
            businessLeadId: business.id,
            domainOpportunityId: domain.id,
            fitScore: match.fitScore,
            reasons: match.reasons,
            matchReason: match.matchReason,
          },
          update: {
            fitScore: match.fitScore,
            reasons: match.reasons,
            matchReason: match.matchReason,
          },
        });
      }
    });

    await Promise.all(matchPromises.filter(Boolean));
  } catch (error) {
    console.error('Background persistence error:', error);
    throw error;
  }
}
