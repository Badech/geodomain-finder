/**
 * Opportunity Detail API Route
 * GET /api/opportunities/[id] - Get opportunity details
 * PATCH /api/opportunities/[id] - Update opportunity
 * DELETE /api/opportunities/[id] - Delete opportunity
 */

import { NextRequest } from 'next/server';
import { getOpportunity, updateOpportunity, deleteOpportunity } from '../../../../lib/services/opportunity-service';
import { updateOpportunitySchema, type UpdateOpportunity } from '../../../../lib/schemas/opportunity';
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
    logRequest('GET', `/api/opportunities/${params.id}`);

    const opportunity = await getOpportunity(params.id);

    if (!opportunity) {
      return createErrorResponse('Opportunity not found', 404, 'NOT_FOUND');
    }

    const duration = Date.now() - startTime;
    logResponse('GET', `/api/opportunities/${params.id}`, 200, duration);

    return createSuccessResponse(opportunity);
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    const body = await parseRequestBody<UpdateOpportunity>(request, updateOpportunitySchema);
    logRequest('PATCH', `/api/opportunities/${params.id}`, body);

    // Check if opportunity exists
    const existing = await getOpportunity(params.id);
    if (!existing) {
      return createErrorResponse('Opportunity not found', 404, 'NOT_FOUND');
    }

    const updated = await updateOpportunity(params.id, body);

    const duration = Date.now() - startTime;
    logResponse('PATCH', `/api/opportunities/${params.id}`, 200, duration);

    return createSuccessResponse(updated);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    logRequest('DELETE', `/api/opportunities/${params.id}`);

    // Check if opportunity exists
    const existing = await getOpportunity(params.id);
    if (!existing) {
      return createErrorResponse('Opportunity not found', 404, 'NOT_FOUND');
    }

    await deleteOpportunity(params.id);

    const duration = Date.now() - startTime;
    logResponse('DELETE', `/api/opportunities/${params.id}`, 204, duration);

    return createSuccessResponse({ deleted: true }, 204);
  });
}
