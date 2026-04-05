/**
 * Opportunities API Route
 * GET /api/opportunities - List opportunities with filters
 * POST /api/opportunities - Create new opportunity
 */

import { NextRequest } from 'next/server';
import { listOpportunities, createOpportunity } from '../../../lib/services/opportunity-service';
import { 
  createOpportunitySchema, 
  opportunityQuerySchema,
  type CreateOpportunity 
} from '../../../lib/schemas/opportunity';
import { 
  createSuccessResponse,
  parseRequestBody,
  getQueryParams,
  withErrorHandling,
  logRequest,
  logResponse 
} from '../../../lib/api/utils';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    const params = getQueryParams(request);
    logRequest('GET', '/api/opportunities', Object.fromEntries(params));

    // Parse and validate query parameters using Zod schema
    const query = opportunityQuerySchema.parse({
      minFitScore: params.get('minFitScore'),
      businessLeadId: params.get('businessLeadId'),
      domainId: params.get('domainId'),
      sortBy: params.get('sortBy'),
      sortOrder: params.get('sortOrder'),
      limit: params.get('limit'),
    });

    // Fetch opportunities
    const opportunities = await listOpportunities({
      minFitScore: query.minFitScore,
      businessLeadId: query.businessLeadId,
      domainId: query.domainId,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      limit: query.limit,
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
    const body = await parseRequestBody<CreateOpportunity>(request, createOpportunitySchema);
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
