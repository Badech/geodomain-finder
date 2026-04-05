/**
 * Lead Detail API Route
 * GET /api/leads/[id] - Get lead details
 * PATCH /api/leads/[id] - Update lead
 */

import { NextRequest } from 'next/server';
import { getLead, updateLead } from '../../../../lib/services/lead-service';
import { updateLeadSchema, type UpdateLead } from '../../../../lib/schemas/lead';
import { 
  createSuccessResponse,
  createErrorResponse,
  parseRequestBody,
  withErrorHandling,
  logRequest,
  logResponse 
} from '../../../../lib/api/utils';

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
    const body = await parseRequestBody<UpdateLead>(request, updateLeadSchema);
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
