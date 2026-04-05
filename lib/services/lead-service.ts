/**
 * Lead Service
 * Manages business leads and their data
 */

import { db } from '../db';

export interface CreateLeadInput {
  placeId?: string;
  name: string;
  niche: string;
  city: string;
  state: string;
  phone?: string;
  email?: string;
  website?: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  currentDomain?: string;
  buyerScore?: number;
  status?: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateLeadInput {
  name?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  currentDomain?: string;
  buyerScore?: number;
  status?: string;
  tags?: string[];
  notes?: string;
}

export interface LeadFilters {
  niche?: string;
  city?: string;
  state?: string;
  status?: string;
  minBuyerScore?: number;
  minRating?: number;
  hasWebsite?: boolean;
  sortBy?: 'buyerScore' | 'rating' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

/**
 * Create a new business lead
 */
export async function createLead(input: CreateLeadInput) {
  return await db.businessLead.create({
    data: {
      placeId: input.placeId,
      name: input.name,
      niche: input.niche,
      city: input.city,
      state: input.state,
      phone: input.phone,
      email: input.email,
      website: input.website,
      address: input.address,
      rating: input.rating || 0,
      reviewCount: input.reviewCount || 0,
      currentDomain: input.currentDomain,
      buyerScore: input.buyerScore || 0,
      status: input.status || 'new',
      tags: input.tags || [],
      notes: input.notes || '',
    },
  });
}

/**
 * Update an existing lead
 */
export async function updateLead(leadId: string, updates: UpdateLeadInput) {
  return await db.businessLead.update({
    where: { id: leadId },
    data: updates,
  });
}

/**
 * Update lead status
 */
export async function updateLeadStatus(
  leadId: string,
  status: 'new' | 'saved' | 'contacted' | 'interested' | 'follow-up' | 'closed'
) {
  return await db.businessLead.update({
    where: { id: leadId },
    data: { status },
  });
}

/**
 * Enrich lead with additional data
 */
export async function enrichLead(
  leadId: string,
  enrichment: {
    email?: string;
    phone?: string;
    website?: string;
    rating?: number;
    reviewCount?: number;
  }
) {
  return await db.businessLead.update({
    where: { id: leadId },
    data: enrichment,
  });
}

/**
 * Get lead by ID
 */
export async function getLead(leadId: string) {
  return await db.businessLead.findUnique({
    where: { id: leadId },
    include: {
      matches: {
        include: {
          domainOpportunity: true,
        },
        orderBy: {
          fitScore: 'desc',
        },
      },
      activityNotes: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
}

/**
 * Get lead by Google Place ID
 */
export async function getLeadByPlaceId(placeId: string) {
  return await db.businessLead.findUnique({
    where: { placeId },
  });
}

/**
 * List leads with filters
 */
export async function listLeads(filters: LeadFilters = {}) {
  const {
    niche,
    city,
    state,
    status,
    minBuyerScore,
    minRating,
    hasWebsite,
    sortBy = 'buyerScore',
    sortOrder = 'desc',
    limit = 100,
  } = filters;

  const where: any = {};

  if (niche) {
    where.niche = { contains: niche, mode: 'insensitive' };
  }

  if (city) {
    where.city = { contains: city, mode: 'insensitive' };
  }

  if (state) {
    where.state = { contains: state, mode: 'insensitive' };
  }

  if (status) {
    where.status = status;
  }

  if (minBuyerScore !== undefined) {
    where.buyerScore = { gte: minBuyerScore };
  }

  if (minRating !== undefined) {
    where.rating = { gte: minRating };
  }

  if (hasWebsite !== undefined) {
    where.website = hasWebsite ? { not: null } : null;
  }

  return await db.businessLead.findMany({
    where,
    orderBy: {
      [sortBy]: sortOrder,
    },
    take: limit,
  });
}

/**
 * Delete a lead
 */
export async function deleteLead(leadId: string) {
  return await db.businessLead.delete({
    where: { id: leadId },
  });
}

/**
 * Get high-value leads (high buyer score)
 */
export async function getHighValueLeads(minScore = 70, limit = 20) {
  return await db.businessLead.findMany({
    where: {
      buyerScore: {
        gte: minScore,
      },
    },
    orderBy: {
      buyerScore: 'desc',
    },
    take: limit,
  });
}

/**
 * Search leads by niche and location
 */
export async function searchLeads(niche: string, city: string, state: string) {
  return await db.businessLead.findMany({
    where: {
      niche: { contains: niche, mode: 'insensitive' },
      city: { contains: city, mode: 'insensitive' },
      state: { contains: state, mode: 'insensitive' },
    },
    orderBy: {
      buyerScore: 'desc',
    },
  });
}

/**
 * Add tags to a lead
 */
export async function addLeadTags(leadId: string, tags: string[]) {
  const lead = await db.businessLead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    throw new Error('Lead not found');
  }

  const currentTags = Array.isArray(lead.tags) ? lead.tags as string[] : [];
  const newTags = [...new Set([...currentTags, ...tags])];

  return await db.businessLead.update({
    where: { id: leadId },
    data: { tags: newTags },
  });
}

/**
 * Remove tags from a lead
 */
export async function removeLeadTags(leadId: string, tags: string[]) {
  const lead = await db.businessLead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    throw new Error('Lead not found');
  }

  const currentTags = Array.isArray(lead.tags) ? lead.tags as string[] : [];
  const newTags = currentTags.filter(tag => !tags.includes(tag));

  return await db.businessLead.update({
    where: { id: leadId },
    data: { tags: newTags },
  });
}

/**
 * Get leads by status
 */
export async function getLeadsByStatus(status: string) {
  return await db.businessLead.findMany({
    where: { status },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}

/**
 * Count leads by criteria
 */
export async function countLeads(filters: Omit<LeadFilters, 'sortBy' | 'sortOrder' | 'limit'> = {}): Promise<number> {
  const {
    niche,
    city,
    state,
    status,
    minBuyerScore,
    minRating,
    hasWebsite,
  } = filters;

  const where: any = {};

  if (niche) {
    where.niche = { contains: niche, mode: 'insensitive' };
  }

  if (city) {
    where.city = { contains: city, mode: 'insensitive' };
  }

  if (state) {
    where.state = { contains: state, mode: 'insensitive' };
  }

  if (status) {
    where.status = status;
  }

  if (minBuyerScore !== undefined) {
    where.buyerScore = { gte: minBuyerScore };
  }

  if (minRating !== undefined) {
    where.rating = { gte: minRating };
  }

  if (hasWebsite !== undefined) {
    where.website = hasWebsite ? { not: null } : null;
  }

  return await db.businessLead.count({ where });
}
