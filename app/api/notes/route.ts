/**
 * Notes API Route
 * GET /api/notes - List notes (for a business or recent)
 * POST /api/notes - Create new note
 */

import { NextRequest } from 'next/server';
import { listNotesForBusiness, getRecentNotes, createNote } from '../../../lib/services/note-service';
import { 
  createNoteSchema, 
  noteQuerySchema,
  type CreateNote 
} from '../../../lib/schemas/note';
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
    logRequest('GET', '/api/notes', Object.fromEntries(params));

    // Parse and validate query parameters using Zod schema
    const query = noteQuerySchema.parse({
      businessLeadId: params.get('businessLeadId'),
      limit: params.get('limit'),
    });

    const businessLeadId = query.businessLeadId;
    const limit = query.limit;

    let notes;
    if (businessLeadId) {
      // Get notes for specific business
      notes = await listNotesForBusiness(businessLeadId);
    } else {
      // Get recent notes across all businesses
      notes = await getRecentNotes(limit);
    }

    const duration = Date.now() - startTime;
    logResponse('GET', '/api/notes', 200, duration);

    return createSuccessResponse({
      notes,
      count: notes.length,
    });
  });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    const body = await parseRequestBody<CreateNote>(request, createNoteSchema);
    logRequest('POST', '/api/notes', body);

    const note = await createNote({ 
      businessLeadId: body.businessLeadId, 
      content: body.content 
    });

    const duration = Date.now() - startTime;
    logResponse('POST', '/api/notes', 201, duration);

    return createSuccessResponse(note, 201);
  });
}
