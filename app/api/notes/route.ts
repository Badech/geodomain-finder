/**
 * Notes API Route
 * GET /api/notes - List notes (for a business or recent)
 * POST /api/notes - Create new note
 */

import { NextRequest } from 'next/server';
import { 
  listNotesForBusiness, 
  getRecentNotes, 
  createNote,
  getUpcomingFollowUps,
  getActionItems,
  getNotesByType,
  getHighPriorityNotes
} from '../../../lib/services/note-service';
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
      type: params.get('type'),
      actionType: params.get('actionType'),
      completed: params.get('completed'),
      priority: params.get('priority'),
      upcoming: params.get('upcoming'),
      limit: params.get('limit'),
    });

    let notes;
    
    // Phase 6: Enhanced query capabilities
    if (query.upcoming) {
      // Get upcoming follow-ups
      notes = await getUpcomingFollowUps(query.limit);
    } else if (query.actionType) {
      // Get action items
      notes = await getActionItems(query.limit);
    } else if (query.priority === 'high' || query.priority === 'urgent') {
      // Get high priority notes
      notes = await getHighPriorityNotes(query.limit);
    } else if (query.type) {
      // Get notes by type
      notes = await getNotesByType(query.type, query.limit);
    } else if (query.businessLeadId) {
      // Get notes for specific business
      notes = await listNotesForBusiness(query.businessLeadId);
    } else {
      // Get recent notes across all businesses
      notes = await getRecentNotes(query.limit);
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
