/**
 * Leads API Route
 * GET /api/leads - List leads with filters
 */

import { NextRequest } from 'next/server';
import { listLeads, countLeads } from '../../../lib/services/lead-service';
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

    // Parse query parameters
    const niche = params.get('niche') || undefined;
    const city = params.get('city') || undefined;
    const state = params.get('state') || undefined;
    const status = params.get('status') || undefined;
    const minBuyerScore = params.get('minBuyerScore') ? parseInt(params.get('minBuyerScore')!) : undefined;
    const minRating = params.get('minRating') ? parseFloat(params.get('minRating')!) : undefined;
    const hasWebsite = params.get('hasWebsite') === 'true' ? true : params.get('hasWebsite') === 'false' ? false : undefined;
    const sortBy = (params.get('sortBy') as 'buyerScore' | 'rating' | 'createdAt' | 'name') || 'buyerScore';
    const sortOrder = (params.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const limit = params.get('limit') ? parseInt(params.get('limit')!) : 100;

    // Fetch leads
    const leads = await listLeads({
      niche,
      city,
      state,
      status,
      minBuyerScore,
      minRating,
      hasWebsite,
      sortBy,
      sortOrder,
      limit,
    });

    // Get total count
    const total = await countLeads({
      niche,
      city,
      state,
      status,
      minBuyerScore,
      minRating,
      hasWebsite,
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
