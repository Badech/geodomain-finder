/**
 * Lead Detail API Route
 * GET /api/leads/[id] - Get lead details
 * PATCH /api/leads/[id] - Update lead
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getLead, updateLead, updateLeadStatus } from '../../../../lib/services/lead-service';
import { 
  createSuccessResponse,
  createErrorResponse,
  parseRequestBody,
  withErrorHandling,
  logRequest,
  logResponse 
} from '../../../../lib/api/utils';

const updateLeadSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  currentDomain: z.string().optional(),
  buyerScore: z.number().min(0).max(100).optional(),
  status: z.enum(['new', 'saved', 'contacted', 'interested', 'follow-up', 'closed']).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type UpdateLeadRequest = z.infer<typeof updateLeadSchema>;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    logRequest('GET', `/api/leads/${params.id}`);

    const lead = await getLead(params.id);

    if (!lead) {
      return createErrorResponse('Lead not found', 404, 'NOT_FOUND');
    }

    const duration = Date.now() - startTime;
    logResponse('GET', `/api/leads/${params.id}`, 200, duration);

    return createSuccessResponse(lead);
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    const body = await parseRequestBody<UpdateLeadRequest>(request, updateLeadSchema);
    logRequest('PATCH', `/api/leads/${params.id}`, body);

    // Check if lead exists
    const existing = await getLead(params.id);
    if (!existing) {
      return createErrorResponse('Lead not found', 404, 'NOT_FOUND');
    }

    // Update lead
    const updated = await updateLead(params.id, body);

    const duration = Date.now() - startTime;
    logResponse('PATCH', `/api/leads/${params.id}`, 200, duration);

    return createSuccessResponse(updated);
  });
}
