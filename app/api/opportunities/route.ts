/**
 * Opportunities API Route
 * GET /api/opportunities - List opportunities with filters
 * POST /api/opportunities - Create new opportunity
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { listOpportunities, createOpportunity } from '../../../lib/services/opportunity-service';
import { 
  createSuccessResponse,
  parseRequestBody,
  getQueryParams,
  withErrorHandling,
  logRequest,
  logResponse 
} from '../../../lib/api/utils';

const createOpportunitySchema = z.object({
  domainId: z.string(),
  businessLeadId: z.string(),
  fitScore: z.number().min(0).max(100),
  reasons: z.array(z.string()),
  matchReason: z.string().optional(),
});

type CreateOpportunityRequest = z.infer<typeof createOpportunitySchema>;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    const params = getQueryParams(request);
    logRequest('GET', '/api/opportunities', Object.fromEntries(params));

    // Parse query parameters
    const minFitScore = params.get('minFitScore') ? parseInt(params.get('minFitScore')!) : undefined;
    const businessLeadId = params.get('businessLeadId') || undefined;
    const domainId = params.get('domainId') || undefined;
    const sortBy = (params.get('sortBy') as 'fitScore' | 'createdAt') || 'fitScore';
    const sortOrder = (params.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const limit = params.get('limit') ? parseInt(params.get('limit')!) : 100;

    // Fetch opportunities
    const opportunities = await listOpportunities({
      minFitScore,
      businessLeadId,
      domainId,
      sortBy,
      sortOrder,
      limit,
    });

    const duration = Date.now() - startTime;
    logResponse('GET', '/api/opportunities', 200, duration);

    return createSuccessResponse({
      opportunities,
      count: opportunities.length,
    });
  });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    const body = await parseRequestBody<CreateOpportunityRequest>(request, createOpportunitySchema);
    logRequest('POST', '/api/opportunities', body);

    const opportunity = await createOpportunity({
      domainId: body.domainId,
      businessLeadId: body.businessLeadId,
      fitScore: body.fitScore,
      reasons: body.reasons,
      matchReason: body.matchReason,
    });

    const duration = Date.now() - startTime;
    logResponse('POST', '/api/opportunities', 201, duration);

    return createSuccessResponse(opportunity, 201);
  });
}
