import { z } from 'zod';

// Create note
export const createNoteSchema = z.object({
  businessLeadId: z.string(),
  content: z.string().min(1).max(5000),
});

export type CreateNote = z.infer<typeof createNoteSchema>;

// Update note
export const updateNoteSchema = z.object({
  content: z.string().min(1).max(5000),
});

export type UpdateNote = z.infer<typeof updateNoteSchema>;
