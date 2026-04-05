/**
 * Notes API Route
 * GET /api/notes - List notes (for a business or recent)
 * POST /api/notes - Create new note
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { listNotesForBusiness, getRecentNotes, createNote } from '../../../lib/services/note-service';
import { 
  createSuccessResponse,
  parseRequestBody,
  getQueryParams,
  withErrorHandling,
  logRequest,
  logResponse 
} from '../../../lib/api/utils';

const createNoteSchema = z.object({
  businessLeadId: z.string(),
  content: z.string().min(1),
});

type CreateNoteRequest = z.infer<typeof createNoteSchema>;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    const params = getQueryParams(request);
    logRequest('GET', '/api/notes', Object.fromEntries(params));

    const businessLeadId = params.get('businessLeadId');
    const limit = params.get('limit') ? parseInt(params.get('limit')!) : 10;

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
    const body = await parseRequestBody<CreateNoteRequest>(request, createNoteSchema);
    logRequest('POST', '/api/notes', body);

    const note = await createNote(body);

    const duration = Date.now() - startTime;
    logResponse('POST', '/api/notes', 201, duration);

    return createSuccessResponse(note, 201);
  });
}
