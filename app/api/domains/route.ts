/**
 * Domains API Route
 * GET /api/domains - List domains with filters
 */

import { NextRequest } from 'next/server';
import { listDomains, countDomains } from '../../../lib/services/domain-service';
import { domainQuerySchema } from '../../../lib/schemas/domain';
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
    logRequest('GET', '/api/domains', Object.fromEntries(params));

    // Parse and validate query parameters using Zod schema
    const query = domainQuerySchema.parse({
      status: params.get('status'),
      saved: params.get('saved'),
      searchQueryId: params.get('searchQueryId'),
      minQualityScore: params.get('minQualityScore'),
      minSeoScore: params.get('minSeoScore'),
      sortBy: params.get('sortBy'),
      sortOrder: params.get('sortOrder'),
      limit: params.get('limit'),
    });

    // Fetch domains
    const domains = await listDomains({
      status: query.status,
      saved: query.saved,
      searchQueryId: query.searchQueryId,
      minQualityScore: query.minQualityScore,
      minSeoScore: query.minSeoScore,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      limit: query.limit,
    });

    // Get total count
    const total = await countDomains({
      status: query.status,
      saved: query.saved,
      searchQueryId: query.searchQueryId,
      minQualityScore: query.minQualityScore,
      minSeoScore: query.minSeoScore,
    });

    const duration = Date.now() - startTime;
    logResponse('GET', '/api/domains', 200, duration);

    return createSuccessResponse({
      domains,
      pagination: {
        total,
        limit,
        returned: domains.length,
      },
    });
  });
}
