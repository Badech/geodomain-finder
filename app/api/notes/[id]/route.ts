/**
 * Note Detail API Route
 * PATCH /api/notes/[id] - Update note
 * DELETE /api/notes/[id] - Delete note
 */

import { NextRequest } from 'next/server';
import { getNote, updateNote, deleteNote } from '../../../../lib/services/note-service';
import { updateNoteSchema, type UpdateNote } from '../../../../lib/schemas/note';
import { 
  createSuccessResponse,
  createErrorResponse,
  parseRequestBody,
  withErrorHandling,
  logRequest,
  logResponse 
} from '../../../../lib/api/utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    const body = await parseRequestBody<UpdateNote>(request, updateNoteSchema);
    logRequest('PATCH', `/api/notes/${params.id}`, body);

    // Check if note exists
    const existing = await getNote(params.id);
    if (!existing) {
      return createErrorResponse('Note not found', 404, 'NOT_FOUND');
    }

    const updated = await updateNote(params.id, { content: body.content });

    const duration = Date.now() - startTime;
    logResponse('PATCH', `/api/notes/${params.id}`, 200, duration);

    return createSuccessResponse(updated);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    logRequest('DELETE', `/api/notes/${params.id}`);

    // Check if note exists
    const existing = await getNote(params.id);
    if (!existing) {
      return createErrorResponse('Note not found', 404, 'NOT_FOUND');
    }

    await deleteNote(params.id);

    const duration = Date.now() - startTime;
    logResponse('DELETE', `/api/notes/${params.id}`, 204, duration);

    return createSuccessResponse({ deleted: true }, 204);
  });
}
