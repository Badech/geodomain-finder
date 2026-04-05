/**
 * Optimized Prisma queries
 * Only select fields that are needed to reduce data transfer
 */

import { db } from '../db';

/**
 * Optimized domain query - only essential fields
 */
export async function getDomainsByIds(ids: string[]) {
  return db.domainOpportunity.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      domain: true,
      tld: true,
      status: true,
      qualityScore: true,
      seoScore: true,
      resaleScore: true,
      reasons: true,
      saved: true,
      createdAt: true,
    },
  });
}

/**
 * Optimized business lead query
 */
export async function getBusinessLeadsByIds(ids: string[]) {
  return db.businessLead.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      placeId: true,
      name: true,
      niche: true,
      city: true,
      state: true,
      phone: true,
      email: true,
      website: true,
      address: true,
      rating: true,
      reviewCount: true,
      currentDomain: true,
      buyerScore: true,
      status: true,
      tags: true,
      createdAt: true,
    },
  });
}

/**
 * Get lead with matches (optimized)
 */
export async function getLeadWithMatches(leadId: string) {
  return db.businessLead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      placeId: true,
      name: true,
      niche: true,
      city: true,
      state: true,
      phone: true,
      email: true,
      website: true,
      address: true,
      rating: true,
      reviewCount: true,
      currentDomain: true,
      buyerScore: true,
      status: true,
      tags: true,
      notes: true,
      createdAt: true,
      matches: {
        select: {
          id: true,
          fitScore: true,
          reasons: true,
          matchReason: true,
          domainOpportunity: {
            select: {
              id: true,
              domain: true,
              tld: true,
              status: true,
              qualityScore: true,
              seoScore: true,
              resaleScore: true,
            },
          },
        },
        orderBy: { fitScore: 'desc' },
        take: 10, // Limit to top 10 matches
      },
      activityNotes: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20, // Limit to recent 20 notes
      },
    },
  });
}

/**
 * List leads with pagination (optimized)
 */
export async function listLeadsOptimized(params: {
  niche?: string;
  city?: string;
  state?: string;
  status?: string;
  minBuyerScore?: number;
  minRating?: number;
  hasWebsite?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'buyerScore' | 'rating' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}) {
  const {
    niche,
    city,
    state,
    status,
    minBuyerScore,
    minRating,
    hasWebsite,
    limit = 20,
    offset = 0,
    sortBy = 'buyerScore',
    sortOrder = 'desc',
  } = params;

  const where: any = {};
  
  if (niche) where.niche = { contains: niche, mode: 'insensitive' };
  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (state) where.state = { contains: state, mode: 'insensitive' };
  if (status) where.status = status;
  if (minBuyerScore !== undefined) where.buyerScore = { gte: minBuyerScore };
  if (minRating !== undefined) where.rating = { gte: minRating };
  if (hasWebsite !== undefined) {
    where.website = hasWebsite ? { not: null } : null;
  }

  return db.businessLead.findMany({
    where,
    select: {
      id: true,
      placeId: true,
      name: true,
      niche: true,
      city: true,
      state: true,
      phone: true,
      email: true,
      website: true,
      address: true,
      rating: true,
      reviewCount: true,
      currentDomain: true,
      buyerScore: true,
      status: true,
      tags: true,
      createdAt: true,
    },
    orderBy: { [sortBy]: sortOrder },
    take: limit,
    skip: offset,
  });
}

/**
 * Get top opportunities (optimized)
 */
export async function getTopOpportunities(limit: number = 20) {
  return db.opportunityMatch.findMany({
    select: {
      id: true,
      fitScore: true,
      reasons: true,
      matchReason: true,
      createdAt: true,
      businessLead: {
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
          phone: true,
          email: true,
          buyerScore: true,
          status: true,
        },
      },
      domainOpportunity: {
        select: {
          id: true,
          domain: true,
          tld: true,
          status: true,
          qualityScore: true,
          seoScore: true,
          resaleScore: true,
        },
      },
    },
    orderBy: { fitScore: 'desc' },
    take: limit,
  });
}

/**
 * Batch upsert domains (optimized for bulk operations)
 */
export async function batchUpsertDomains(
  domains: Array<{
    domain: string;
    tld: string;
    status: string;
    qualityScore: number;
    seoScore: number;
    resaleScore: number;
    reasons: string[];
    searchQueryId: string;
  }>
) {
  // Use transaction for better performance
  return db.$transaction(
    domains.map(domain =>
      db.domainOpportunity.upsert({
        where: { domain: domain.domain },
        create: domain,
        update: {
          status: domain.status,
          qualityScore: domain.qualityScore,
          seoScore: domain.seoScore,
          resaleScore: domain.resaleScore,
          reasons: domain.reasons,
        },
      })
    ),
    {
      maxWait: 10000, // 10 seconds max wait
      timeout: 30000, // 30 seconds timeout
    }
  );
}
