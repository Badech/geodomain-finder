/**
 * Note Service
 * Manages activity notes for business leads
 */

import { db } from '../db';

export interface CreateNoteInput {
  businessLeadId: string;
  content: string;
}

export interface UpdateNoteInput {
  content: string;
}

/**
 * Create a new activity note
 */
export async function createNote(input: CreateNoteInput) {
  return await db.activityNote.create({
    data: {
      businessLeadId: input.businessLeadId,
      content: input.content,
    },
    include: {
      businessLead: true,
    },
  });
}

/**
 * Update an existing note
 */
export async function updateNote(noteId: string, updates: UpdateNoteInput) {
  return await db.activityNote.update({
    where: { id: noteId },
    data: {
      content: updates.content,
    },
    include: {
      businessLead: true,
    },
  });
}

/**
 * Get note by ID
 */
export async function getNote(noteId: string) {
  return await db.activityNote.findUnique({
    where: { id: noteId },
    include: {
      businessLead: true,
    },
  });
}

/**
 * List all notes for a business lead
 */
export async function listNotesForBusiness(businessLeadId: string) {
  return await db.activityNote.findMany({
    where: {
      businessLeadId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Delete a note
 */
export async function deleteNote(noteId: string) {
  return await db.activityNote.delete({
    where: { id: noteId },
  });
}

/**
 * Get recent notes across all businesses
 */
export async function getRecentNotes(limit = 10) {
  return await db.activityNote.findMany({
    include: {
      businessLead: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

/**
 * Count notes for a business
 */
export async function countNotesForBusiness(businessLeadId: string): Promise<number> {
  return await db.activityNote.count({
    where: {
      businessLeadId,
    },
  });
}
