import { z } from 'zod';

// Business search input
export const businessSearchInputSchema = z.object({
  niche: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  maxResults: z.number().min(1).max(50).optional().default(20),
});

export type BusinessSearchInput = z.infer<typeof businessSearchInputSchema>;

// Email enrichment input
export const emailEnrichmentInputSchema = z.object({
  businessLeadId: z.string().optional(),
  websiteUrl: z.string().url(),
});

export type EmailEnrichmentInput = z.infer<typeof emailEnrichmentInputSchema>;

// Public email result
export const publicEmailResultSchema = z.object({
  email: z.string().email().nullable(),
  source: z.string().nullable(), // URL where email was found
  confidence: z.enum(['high', 'medium', 'low']).nullable(),
  foundAt: z.date(),
});

export type PublicEmailResult = z.infer<typeof publicEmailResultSchema>;

// Lead status update
export const leadStatusUpdateSchema = z.object({
  status: z.enum(['new', 'saved', 'contacted', 'interested', 'follow-up', 'closed']),
});

export type LeadStatusUpdate = z.infer<typeof leadStatusUpdateSchema>;

// Lead update schema (for PATCH /api/leads/[id])
export const updateLeadSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().min(10).max(20).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.string().max(500).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  currentDomain: z.string().max(255).optional(),
  buyerScore: z.number().min(0).max(100).optional(),
  status: z.enum(['new', 'saved', 'contacted', 'interested', 'follow-up', 'closed']).optional(),
  tags: z.array(z.string().max(50)).optional(),
  notes: z.string().max(5000).optional(),
});

export type UpdateLead = z.infer<typeof updateLeadSchema>;

// Lead query filters (for GET /api/leads)
export const leadQuerySchema = z.object({
  niche: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  status: z.enum(['new', 'saved', 'contacted', 'interested', 'follow-up', 'closed']).optional(),
  minBuyerScore: z.coerce.number().min(0).max(100).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  hasWebsite: z.coerce.boolean().optional(),
  sortBy: z.enum(['buyerScore', 'rating', 'createdAt', 'name']).optional().default('buyerScore'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.coerce.number().min(1).max(100).optional().default(100),
});

export type LeadQuery = z.infer<typeof leadQuerySchema>;
