import { z } from 'zod';

// Create opportunity
export const createOpportunitySchema = z.object({
  domainId: z.string().min(1, 'Domain ID is required'),
  businessLeadId: z.string().min(1, 'Business Lead ID is required'),
  fitScore: z.number().min(0).max(100),
  reasons: z.array(z.string().max(200)),
  matchReason: z.string().max(500).optional(),
});

export type CreateOpportunity = z.infer<typeof createOpportunitySchema>;

// Update opportunity
export const updateOpportunitySchema = z.object({
  fitScore: z.number().min(0).max(100).optional(),
  reasons: z.array(z.string().max(200)).optional(),
  matchReason: z.string().max(500).optional(),
});

export type UpdateOpportunity = z.infer<typeof updateOpportunitySchema>;

// Opportunity query filters (for GET /api/opportunities)
export const opportunityQuerySchema = z.object({
  minFitScore: z.coerce.number().min(0).max(100).optional(),
  businessLeadId: z.string().optional(),
  domainId: z.string().optional(),
  sortBy: z.enum(['fitScore', 'createdAt']).optional().default('fitScore'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.coerce.number().min(1).max(100).optional().default(100),
});

export type OpportunityQuery = z.infer<typeof opportunityQuerySchema>;

// Legacy filters (deprecated - use opportunityQuerySchema)
export const opportunityFiltersSchema = z.object({
  minFitScore: z.number().min(0).max(100).optional(),
  status: z.enum(['new', 'saved', 'contacted', 'interested', 'follow-up', 'closed']).optional(),
  sortBy: z.enum(['fitScore', 'createdAt', 'businessName']).optional().default('fitScore'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type OpportunityFilters = z.infer<typeof opportunityFiltersSchema>;
