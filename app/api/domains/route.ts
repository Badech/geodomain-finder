/**
 * Domains API Route
 * GET /api/domains - List domains with filters
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { listDomains, countDomains } from '../../../lib/services/domain-service';
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

    // Parse query parameters
    const status = params.get('status') as 'available' | 'taken' | 'unknown' | null;
    const saved = params.get('saved') === 'true' ? true : params.get('saved') === 'false' ? false : undefined;
    const searchQueryId = params.get('searchQueryId') || undefined;
    const minQualityScore = params.get('minQualityScore') ? parseInt(params.get('minQualityScore')!) : undefined;
    const minSeoScore = params.get('minSeoScore') ? parseInt(params.get('minSeoScore')!) : undefined;
    const sortBy = (params.get('sortBy') as 'qualityScore' | 'seoScore' | 'resaleScore' | 'createdAt') || 'qualityScore';
    const sortOrder = (params.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const limit = params.get('limit') ? parseInt(params.get('limit')!) : 100;

    // Fetch domains
    const domains = await listDomains({
      status: status || undefined,
      saved,
      searchQueryId,
      minQualityScore,
      minSeoScore,
      sortBy,
      sortOrder,
      limit,
    });

    // Get total count
    const total = await countDomains({
      status: status || undefined,
      saved,
      searchQueryId,
      minQualityScore,
      minSeoScore,
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
