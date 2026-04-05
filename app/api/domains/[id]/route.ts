/**
 * Domain Detail API Route
 * GET /api/domains/[id] - Get domain details
 * PATCH /api/domains/[id] - Update domain
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getDomain, updateDomain, toggleDomainSaved } from '../../../../lib/services/domain-service';
import { 
  createSuccessResponse,
  createErrorResponse,
  parseRequestBody,
  withErrorHandling,
  logRequest,
  logResponse 
} from '../../../../lib/api/utils';

const updateDomainSchema = z.object({
  saved: z.boolean().optional(),
  status: z.enum(['available', 'taken', 'unknown']).optional(),
  qualityScore: z.number().min(0).max(100).optional(),
  seoScore: z.number().min(0).max(100).optional(),
  resaleScore: z.number().min(0).max(100).optional(),
  reasons: z.array(z.string()).optional(),
});

type UpdateDomainRequest = z.infer<typeof updateDomainSchema>;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    logRequest('GET', `/api/domains/${params.id}`);

    const domain = await getDomain(params.id);

    if (!domain) {
      return createErrorResponse('Domain not found', 404, 'NOT_FOUND');
    }

    const duration = Date.now() - startTime;
    logResponse('GET', `/api/domains/${params.id}`, 200, duration);

    return createSuccessResponse(domain);
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    const body = await parseRequestBody<UpdateDomainRequest>(request, updateDomainSchema);
    logRequest('PATCH', `/api/domains/${params.id}`, body);

    // Check if domain exists
    const existing = await getDomain(params.id);
    if (!existing) {
      return createErrorResponse('Domain not found', 404, 'NOT_FOUND');
    }

    // Handle saved toggle separately if needed
    let updated;
    if (body.saved !== undefined && Object.keys(body).length === 1) {
      // Just toggle saved status
      updated = await toggleDomainSaved(params.id);
    } else {
      // Update other fields
      const { saved, ...updateData } = body;
      updated = await updateDomain(params.id, updateData);
      
      // Then toggle saved if provided
      if (saved !== undefined && saved !== updated.saved) {
        updated = await toggleDomainSaved(params.id);
      }
    }

    const duration = Date.now() - startTime;
    logResponse('PATCH', `/api/domains/${params.id}`, 200, duration);

    return createSuccessResponse(updated);
  });
}
