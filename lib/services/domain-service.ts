/**
 * Domain Service
 * Manages domain opportunities in the database
 */

import { db } from '../db';

export interface CreateDomainInput {
  domain: string;
  tld: string;
  status: 'available' | 'taken' | 'unknown';
  qualityScore: number;
  seoScore: number;
  resaleScore: number;
  reasons: string[];
  searchQueryId: string;
}

export interface UpdateDomainInput {
  status?: 'available' | 'taken' | 'unknown';
  qualityScore?: number;
  seoScore?: number;
  resaleScore?: number;
  reasons?: string[];
  saved?: boolean;
}

export interface DomainFilters {
  status?: 'available' | 'taken' | 'unknown';
  saved?: boolean;
  searchQueryId?: string;
  minQualityScore?: number;
  minSeoScore?: number;
  minResaleScore?: number;
  sortBy?: 'qualityScore' | 'seoScore' | 'resaleScore' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

/**
 * Create a new domain opportunity
 */
export async function createDomain(input: CreateDomainInput) {
  return await db.domainOpportunity.create({
    data: {
      domain: input.domain,
      tld: input.tld,
      status: input.status,
      qualityScore: input.qualityScore,
      seoScore: input.seoScore,
      resaleScore: input.resaleScore,
      reasons: input.reasons,
      searchQueryId: input.searchQueryId,
    },
  });
}

/**
 * Update an existing domain
 */
export async function updateDomain(domainId: string, updates: UpdateDomainInput) {
  return await db.domainOpportunity.update({
    where: { id: domainId },
    data: updates,
  });
}

/**
 * Get domain by ID
 */
export async function getDomain(domainId: string) {
  return await db.domainOpportunity.findUnique({
    where: { id: domainId },
    include: {
      matches: {
        include: {
          businessLead: true,
        },
        orderBy: {
          fitScore: 'desc',
        },
      },
      searchQuery: true,
    },
  });
}

/**
 * Get domain by name
 */
export async function getDomainByName(domain: string) {
  return await db.domainOpportunity.findUnique({
    where: { domain },
  });
}

/**
 * List domains with filters
 */
export async function listDomains(filters: DomainFilters = {}) {
  const {
    status,
    saved,
    searchQueryId,
    minQualityScore,
    minSeoScore,
    minResaleScore,
    sortBy = 'qualityScore',
    sortOrder = 'desc',
    limit = 100,
  } = filters;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (saved !== undefined) {
    where.saved = saved;
  }

  if (searchQueryId) {
    where.searchQueryId = searchQueryId;
  }

  if (minQualityScore !== undefined) {
    where.qualityScore = { gte: minQualityScore };
  }

  if (minSeoScore !== undefined) {
    where.seoScore = { gte: minSeoScore };
  }

  if (minResaleScore !== undefined) {
    where.resaleScore = { gte: minResaleScore };
  }

  return await db.domainOpportunity.findMany({
    where,
    orderBy: {
      [sortBy]: sortOrder,
    },
    take: limit,
  });
}

/**
 * Toggle saved status for a domain
 */
export async function toggleDomainSaved(domainId: string) {
  const domain = await db.domainOpportunity.findUnique({
    where: { id: domainId },
  });

  if (!domain) {
    throw new Error('Domain not found');
  }

  return await db.domainOpportunity.update({
    where: { id: domainId },
    data: { saved: !domain.saved },
  });
}

/**
 * Delete a domain
 */
export async function deleteDomain(domainId: string) {
  return await db.domainOpportunity.delete({
    where: { id: domainId },
  });
}

/**
 * Get available domains
 */
export async function getAvailableDomains(limit = 50) {
  return await db.domainOpportunity.findMany({
    where: {
      status: 'available',
    },
    orderBy: {
      qualityScore: 'desc',
    },
    take: limit,
  });
}

/**
 * Get saved domains
 */
export async function getSavedDomains() {
  return await db.domainOpportunity.findMany({
    where: {
      saved: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get premium domains (high scores)
 */
export async function getPremiumDomains(minScore = 80, limit = 20) {
  return await db.domainOpportunity.findMany({
    where: {
      status: 'available',
      qualityScore: { gte: minScore },
    },
    orderBy: {
      qualityScore: 'desc',
    },
    take: limit,
  });
}

/**
 * Count domains by criteria
 */
export async function countDomains(
  filters: Omit<DomainFilters, 'sortBy' | 'sortOrder' | 'limit'> = {}
): Promise<number> {
  const {
    status,
    saved,
    searchQueryId,
    minQualityScore,
    minSeoScore,
    minResaleScore,
  } = filters;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (saved !== undefined) {
    where.saved = saved;
  }

  if (searchQueryId) {
    where.searchQueryId = searchQueryId;
  }

  if (minQualityScore !== undefined) {
    where.qualityScore = { gte: minQualityScore };
  }

  if (minSeoScore !== undefined) {
    where.seoScore = { gte: minSeoScore };
  }

  if (minResaleScore !== undefined) {
    where.resaleScore = { gte: minResaleScore };
  }

  return await db.domainOpportunity.count({ where });
}
