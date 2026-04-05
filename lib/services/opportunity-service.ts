/**
 * Opportunity Service
 * Manages domain opportunities and their matches with businesses
 */

import { db } from '../db';

export interface CreateOpportunityInput {
  domainId: string;
  businessLeadId: string;
  fitScore: number;
  reasons: string[];
  matchReason?: string;
}

export interface UpdateOpportunityInput {
  fitScore?: number;
  reasons?: string[];
  matchReason?: string;
}

export interface OpportunityFilters {
  minFitScore?: number;
  businessLeadId?: string;
  domainId?: string;
  sortBy?: 'fitScore' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

/**
 * Create a new opportunity match
 */
export async function createOpportunity(input: CreateOpportunityInput) {
  return await db.opportunityMatch.create({
    data: {
      businessLeadId: input.businessLeadId,
      domainOpportunityId: input.domainId,
      fitScore: input.fitScore,
      reasons: input.reasons,
      matchReason: input.matchReason,
    },
    include: {
      businessLead: true,
      domainOpportunity: true,
    },
  });
}

/**
 * Update an existing opportunity
 */
export async function updateOpportunity(
  opportunityId: string,
  updates: UpdateOpportunityInput
) {
  return await db.opportunityMatch.update({
    where: { id: opportunityId },
    data: updates,
    include: {
      businessLead: true,
      domainOpportunity: true,
    },
  });
}

/**
 * Get opportunity by ID
 */
export async function getOpportunity(opportunityId: string) {
  return await db.opportunityMatch.findUnique({
    where: { id: opportunityId },
    include: {
      businessLead: true,
      domainOpportunity: true,
    },
  });
}

/**
 * List opportunities with filters
 */
export async function listOpportunities(filters: OpportunityFilters = {}) {
  const {
    minFitScore,
    businessLeadId,
    domainId,
    sortBy = 'fitScore',
    sortOrder = 'desc',
    limit = 100,
  } = filters;

  const where: any = {};

  if (minFitScore !== undefined) {
    where.fitScore = { gte: minFitScore };
  }

  if (businessLeadId) {
    where.businessLeadId = businessLeadId;
  }

  if (domainId) {
    where.domainOpportunityId = domainId;
  }

  return await db.opportunityMatch.findMany({
    where,
    include: {
      businessLead: true,
      domainOpportunity: true,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    take: limit,
  });
}

/**
 * Delete an opportunity
 */
export async function deleteOpportunity(opportunityId: string) {
  return await db.opportunityMatch.delete({
    where: { id: opportunityId },
  });
}

/**
 * Get top opportunities (highest fit scores)
 */
export async function getTopOpportunities(limit = 10) {
  return await db.opportunityMatch.findMany({
    include: {
      businessLead: true,
      domainOpportunity: true,
    },
    orderBy: {
      fitScore: 'desc',
    },
    take: limit,
  });
}

/**
 * Get opportunities for a specific business
 */
export async function getBusinessOpportunities(businessLeadId: string) {
  return await db.opportunityMatch.findMany({
    where: {
      businessLeadId,
    },
    include: {
      domainOpportunity: true,
    },
    orderBy: {
      fitScore: 'desc',
    },
  });
}

/**
 * Get opportunities for a specific domain
 */
export async function getDomainOpportunities(domainId: string) {
  return await db.opportunityMatch.findMany({
    where: {
      domainOpportunityId: domainId,
    },
    include: {
      businessLead: true,
    },
    orderBy: {
      fitScore: 'desc',
    },
  });
}
