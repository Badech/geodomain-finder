import { z } from 'zod';

/**
 * Common validation schemas
 */

// String sanitization
export const sanitizedString = (maxLength: number = 255) =>
  z.string()
    .trim()
    .max(maxLength)
    .transform(val => {
      // Remove potentially dangerous characters
      return val.replace(/[<>]/g, '');
    });

// Email validation
export const emailSchema = z.string().email('Invalid email address').toLowerCase();

// URL validation
export const urlSchema = z.string().url('Invalid URL').max(2048);

// Domain validation
export const domainSchema = z.string()
  .regex(/^[a-z0-9-]+\.[a-z]{2,}$/i, 'Invalid domain format')
  .max(255);

// Phone validation (flexible)
export const phoneSchema = z.string()
  .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number')
  .min(10)
  .max(20);

// ID validation (CUID)
export const idSchema = z.string()
  .regex(/^c[a-z0-9]{24}$/, 'Invalid ID format');

// Pagination
export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

// Sort order
export const sortOrderSchema = z.enum(['asc', 'desc']).optional().default('desc');

/**
 * Sanitize HTML to prevent XSS
 * Basic implementation - use DOMPurify for more robust solution
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize search input
 */
export function validateSearchInput(input: unknown) {
  const schema = z.object({
    niche: sanitizedString(100).min(1),
    city: sanitizedString(100).min(1),
    state: sanitizedString(50).min(1),
    modifiers: z.array(sanitizedString(50)).optional(),
    maxDomains: z.number().min(1).max(50).optional().default(20),
    maxBusinesses: z.number().min(1).max(30).optional().default(20),
  });

  return schema.parse(input);
}

/**
 * Validate ID parameter
 */
export function validateId(id: string): string {
  return idSchema.parse(id);
}

/**
 * Common API query parameters
 */
export const commonQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
  sortBy: z.string().optional(),
  sortOrder: sortOrderSchema,
});

/**
 * Lead filter schema
 */
export const leadFilterSchema = z.object({
  niche: sanitizedString(100).optional(),
  city: sanitizedString(100).optional(),
  state: sanitizedString(50).optional(),
  status: z.enum(['new', 'saved', 'contacted', 'interested', 'follow-up', 'closed']).optional(),
  minBuyerScore: z.coerce.number().min(0).max(100).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  hasWebsite: z.coerce.boolean().optional(),
});

/**
 * Note creation schema
 */
export const noteSchema = z.object({
  content: sanitizedString(5000).min(1, 'Note content is required'),
  businessLeadId: idSchema,
});

/**
 * Opportunity creation schema
 */
export const opportunitySchema = z.object({
  domainId: idSchema,
  businessLeadId: idSchema,
  fitScore: z.number().min(0).max(100),
  reasons: z.array(sanitizedString(200)),
  matchReason: sanitizedString(500).optional(),
});
