import { z } from 'zod';

// Create note (Phase 6: Enhanced with outreach fields)
export const createNoteSchema = z.object({
  businessLeadId: z.string().min(1, 'Business Lead ID is required'),
  content: z.string().min(1, 'Note content is required').max(5000, 'Note content must be less than 5000 characters'),
  type: z.enum(['note', 'call', 'email', 'meeting', 'follow-up']).optional().default('note'),
  actionType: z.enum(['call', 'email', 'save-for-later', 'high-priority', 'follow-up']).optional(),
  followUpDate: z.coerce.date().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal'),
});

export type CreateNote = z.infer<typeof createNoteSchema>;

// Update note (Phase 6: Enhanced with outreach fields)
export const updateNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(5000, 'Note content must be less than 5000 characters').optional(),
  type: z.enum(['note', 'call', 'email', 'meeting', 'follow-up']).optional(),
  actionType: z.enum(['call', 'email', 'save-for-later', 'high-priority', 'follow-up']).optional(),
  followUpDate: z.coerce.date().optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
});

export type UpdateNote = z.infer<typeof updateNoteSchema>;

// Note query filters (for GET /api/notes) - Phase 6: Enhanced
export const noteQuerySchema = z.object({
  businessLeadId: z.string().optional(),
  type: z.enum(['note', 'call', 'email', 'meeting', 'follow-up']).optional(),
  actionType: z.enum(['call', 'email', 'save-for-later', 'high-priority', 'follow-up']).optional(),
  completed: z.coerce.boolean().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  upcoming: z.coerce.boolean().optional(), // Get notes with upcoming follow-up dates
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export type NoteQuery = z.infer<typeof noteQuerySchema>;
