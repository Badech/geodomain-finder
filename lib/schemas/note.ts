import { z } from 'zod';

// Create note
export const createNoteSchema = z.object({
  businessLeadId: z.string().min(1, 'Business Lead ID is required'),
  content: z.string().min(1, 'Note content is required').max(5000, 'Note content must be less than 5000 characters'),
});

export type CreateNote = z.infer<typeof createNoteSchema>;

// Update note
export const updateNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(5000, 'Note content must be less than 5000 characters'),
});

export type UpdateNote = z.infer<typeof updateNoteSchema>;

// Note query filters (for GET /api/notes)
export const noteQuerySchema = z.object({
  businessLeadId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export type NoteQuery = z.infer<typeof noteQuerySchema>;
