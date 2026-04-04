import { z } from 'zod';

// Create opportunity
export const createOpportunitySchema = z.object({
  domainId: z.string(),
  businessLeadId: z.string(),
  fitScore: z.number().min(0).max(100),
  reasons: z.array(z.string()),
  matchReason: z.string().optional(),
});

export type CreateOpportunity = z.infer<typeof createOpportunitySchema>;

// Update opportunity
export const updateOpportunitySchema = z.object({
  fitScore: z.number().min(0).max(100).optional(),
  reasons: z.array(z.string()).optional(),
  matchReason: z.string().optional(),
});

export type UpdateOpportunity = z.infer<typeof updateOpportunitySchema>;

// Opportunity filters
export const opportunityFiltersSchema = z.object({
  minFitScore: z.number().min(0).max(100).optional(),
  status: z.enum(['new', 'saved', 'contacted', 'interested', 'follow-up', 'closed']).optional(),
  sortBy: z.enum(['fitScore', 'createdAt', 'businessName']).optional().default('fitScore'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type OpportunityFilters = z.infer<typeof opportunityFiltersSchema>;
