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

// Request validation schema
const searchRequestSchema = z.object({
  niche: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  modifiers: z.array(z.string()).optional(),
  maxDomains: z.number().min(1).max(50).optional().default(20),
  maxBusinesses: z.number().min(1).max(30).optional().default(20),
});

type SearchRequest = z.infer<typeof searchRequestSchema>;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    // Parse and validate request
    const body = await parseRequestBody<SearchRequest>(request, searchRequestSchema);
    logRequest('POST', '/api/search', body);

    // Initialize providers and orchestrator
    const { domainProvider, leadProvider, emailExtractor } = initializeProviders();
    const orchestrator = new SearchOrchestrator(domainProvider, leadProvider, emailExtractor);

    // Execute search
    const result = await orchestrator.executeSearch({
      niche: body.niche,
      city: body.city,
      state: body.state,
      modifiers: body.modifiers,
      maxDomains: body.maxDomains,
      maxBusinesses: body.maxBusinesses,
    });

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
    const domainPromises = result.domains.map(domain =>
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
    const businessPromises = result.businesses.map(business =>
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
    const matchPromises = result.matches.map(async (match) => {
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

    // Return response matching UI expectations
    const duration = Date.now() - startTime;
    logResponse('POST', '/api/search', 200, duration);

    return createSuccessResponse({
      searchQueryId: searchQuery.id,
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
      },
    });
  });
}
