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
  status: z.enum(['available', 'taken', 'unknown']),
  checkedAt: z.date(),
});

export type DomainAvailabilityResult = z.infer<typeof domainAvailabilityResultSchema>;
