/**
 * Leads API Route
 * GET /api/leads - List leads with filters
 */

import { NextRequest } from 'next/server';
import { listLeads, countLeads } from '../../../lib/services/lead-service';
import { leadQuerySchema } from '../../../lib/schemas/lead';
import { 
  createSuccessResponse, 
  getQueryParams,
  withErrorHandling,
  logRequest,
  logResponse 
} from '../../../lib/api/utils';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    const params = getQueryParams(request);
    logRequest('GET', '/api/leads', Object.fromEntries(params));

    // Parse and validate query parameters using Zod schema
    const query = leadQuerySchema.parse({
      niche: params.get('niche'),
      city: params.get('city'),
      state: params.get('state'),
      status: params.get('status'),
      minBuyerScore: params.get('minBuyerScore'),
      minRating: params.get('minRating'),
      hasWebsite: params.get('hasWebsite'),
      sortBy: params.get('sortBy'),
      sortOrder: params.get('sortOrder'),
      limit: params.get('limit'),
    });

    // Fetch leads
    const leads = await listLeads({
      niche: query.niche,
      city: query.city,
      state: query.state,
      status: query.status,
      minBuyerScore: query.minBuyerScore,
      minRating: query.minRating,
      hasWebsite: query.hasWebsite,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      limit: query.limit,
    });

    // Get total count
    const total = await countLeads({
      niche: query.niche,
      city: query.city,
      state: query.state,
      status: query.status,
      minBuyerScore: query.minBuyerScore,
      minRating: query.minRating,
      hasWebsite: query.hasWebsite,
    });

    const duration = Date.now() - startTime;
    logResponse('GET', '/api/leads', 200, duration);

    return createSuccessResponse({
      leads,
      pagination: {
        total,
        limit,
        returned: leads.length,
      },
    });
  });
}
