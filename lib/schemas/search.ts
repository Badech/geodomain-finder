import { z } from 'zod';

// Search input validation
export const searchInputSchema = z.object({
  niche: z.string().min(1, 'Niche is required').max(100),
  state: z.string().min(1, 'State is required').max(50),
  city: z.string().min(1, 'City is required').max(100),
  modifiers: z.array(z.string()).optional().default([]),
  filters: z.object({
    comOnly: z.boolean().optional().default(true),
    minQualityScore: z.number().min(0).max(100).optional().default(0),
    excludeLongDomains: z.boolean().optional().default(false),
    includeVariants: z.boolean().optional().default(true),
    minReviewCount: z.number().min(0).optional().default(0),
    onlyWeakDomains: z.boolean().optional().default(false),
    onlyWithWebsite: z.boolean().optional().default(false),
    onlyWithPhone: z.boolean().optional().default(false),
    onlyWithEmail: z.boolean().optional().default(false),
  }).optional(),
});

export type SearchInput = z.infer<typeof searchInputSchema>;

// Search response types
export const domainOpportunityResponseSchema = z.object({
  id: z.string(),
  domain: z.string(),
  tld: z.string(),
  status: z.enum(['available', 'taken', 'unknown']),
  qualityScore: z.number(),
  seoScore: z.number(),
  resaleScore: z.number(),
  reasons: z.array(z.string()),
  saved: z.boolean(),
});

export type DomainOpportunityResponse = z.infer<typeof domainOpportunityResponseSchema>;

export const businessLeadResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  niche: z.string(),
  city: z.string(),
  state: z.string(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  website: z.string().url().nullable(),
  address: z.string(),
  rating: z.number(),
  reviewCount: z.number(),
  currentDomain: z.string().nullable(),
  buyerScore: z.number(),
  status: z.enum(['new', 'saved', 'contacted', 'interested', 'follow-up', 'closed']),
  tags: z.array(z.string()),
  recommendedDomain: z.string().nullable(),
  recommendedDomainId: z.string().nullable(),
  matchReason: z.string().nullable(),
});

export type BusinessLeadResponse = z.infer<typeof businessLeadResponseSchema>;

export const searchResponseSchema = z.object({
  domains: z.array(domainOpportunityResponseSchema),
  businesses: z.array(businessLeadResponseSchema),
  searchQueryId: z.string(),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;
