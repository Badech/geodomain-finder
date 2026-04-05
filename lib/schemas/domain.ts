import { z } from 'zod';

// Domain generation input
export const domainGenerationInputSchema = z.object({
  niche: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  city: z.string().min(1).max(100),
  modifiers: z.array(z.string()).optional().default([]),
  maxResults: z.number().min(1).max(100).optional().default(20),
});

export type DomainGenerationInput = z.infer<typeof domainGenerationInputSchema>;

// Domain availability check input
export const domainAvailabilityInputSchema = z.object({
  domains: z.array(z.string().min(1)).min(1).max(100),
});

export type DomainAvailabilityInput = z.infer<typeof domainAvailabilityInputSchema>;

// Domain availability result
export const domainAvailabilityResultSchema = z.object({
  domain: z.string(),
  available: z.boolean(),
  status: z.enum(['available', 'taken', 'premium', 'invalid', 'error', 'unknown']),
  checkedAt: z.date(),
  provider: z.string().optional(),
  error: z.string().optional(),
  availabilitySource: z.string().optional(),
  providerResponseCode: z.number().optional(),
  checkedAtTimestamp: z.number().optional(),
  cacheHit: z.boolean().optional(),
});

export type DomainAvailabilityResult = z.infer<typeof domainAvailabilityResultSchema>;

// Domain update schema (for PATCH /api/domains/[id])
export const updateDomainSchema = z.object({
  saved: z.boolean().optional(),
  status: z.enum(['available', 'taken', 'unknown']).optional(),
  qualityScore: z.number().min(0).max(100).optional(),
  seoScore: z.number().min(0).max(100).optional(),
  resaleScore: z.number().min(0).max(100).optional(),
  reasons: z.array(z.string()).optional(),
});

export type UpdateDomain = z.infer<typeof updateDomainSchema>;

// Domain query filters (for GET /api/domains)
export const domainQuerySchema = z.object({
  status: z.enum(['available', 'taken', 'unknown']).optional(),
  saved: z.coerce.boolean().optional(),
  searchQueryId: z.string().optional(),
  minQualityScore: z.coerce.number().min(0).max(100).optional(),
  minSeoScore: z.coerce.number().min(0).max(100).optional(),
  sortBy: z.enum(['qualityScore', 'seoScore', 'resaleScore', 'createdAt']).optional().default('qualityScore'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.coerce.number().min(1).max(100).optional().default(100),
});

export type DomainQuery = z.infer<typeof domainQuerySchema>;
