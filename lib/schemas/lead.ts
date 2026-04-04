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
