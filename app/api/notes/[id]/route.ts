/**
 * Note Detail API Route
 * PATCH /api/notes/[id] - Update note
 * DELETE /api/notes/[id] - Delete note
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getNote, updateNote, deleteNote } from '../../../../lib/services/note-service';
import { 
  createSuccessResponse,
  createErrorResponse,
  parseRequestBody,
  withErrorHandling,
  logRequest,
  logResponse 
} from '../../../../lib/api/utils';

const updateNoteSchema = z.object({
  content: z.string().min(1).max(5000),
});

type UpdateNoteRequest = z.infer<typeof updateNoteSchema>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  return withErrorHandling(async () => {
    const body = await parseRequestBody<UpdateNoteRequest>(request, updateNoteSchema);
    logRequest('PATCH', `/api/notes/${params.id}`, body);

    // Check if note exists
    const existing = await getNote(params.id);
    if (!existing) {
      return createErrorResponse('Note not found', 404, 'NOT_FOUND');
    }

    const updated = await updateNote(params.id, body);

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
