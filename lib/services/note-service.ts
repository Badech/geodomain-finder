/**
 * Note Service
 * Manages activity notes for business leads
 * Phase 6: Enhanced with outreach tracking
 */

import { db } from '../db';

export interface CreateNoteInput {
  businessLeadId: string;
  content: string;
  type?: 'note' | 'call' | 'email' | 'meeting' | 'follow-up';
  actionType?: 'call' | 'email' | 'save-for-later' | 'high-priority' | 'follow-up';
  followUpDate?: Date;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface UpdateNoteInput {
  content?: string;
  type?: 'note' | 'call' | 'email' | 'meeting' | 'follow-up';
  actionType?: 'call' | 'email' | 'save-for-later' | 'high-priority' | 'follow-up';
  followUpDate?: Date;
  completed?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * Create a new activity note
 */
export async function createNote(input: CreateNoteInput) {
  return await db.activityNote.create({
    data: {
      businessLeadId: input.businessLeadId,
      content: input.content,
      type: input.type || 'note',
      actionType: input.actionType,
      followUpDate: input.followUpDate,
      priority: input.priority || 'normal',
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
  const data: any = {};
  
  if (updates.content !== undefined) data.content = updates.content;
  if (updates.type !== undefined) data.type = updates.type;
  if (updates.actionType !== undefined) data.actionType = updates.actionType;
  if (updates.followUpDate !== undefined) data.followUpDate = updates.followUpDate;
  if (updates.completed !== undefined) data.completed = updates.completed;
  if (updates.priority !== undefined) data.priority = updates.priority;
  
  return await db.activityNote.update({
    where: { id: noteId },
    data,
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

/**
 * Phase 6: Get upcoming follow-up notes
 */
export async function getUpcomingFollowUps(limit = 20) {
  return await db.activityNote.findMany({
    where: {
      followUpDate: {
        gte: new Date(), // Future dates only
      },
      completed: false,
    },
    include: {
      businessLead: true,
    },
    orderBy: {
      followUpDate: 'asc',
    },
    take: limit,
  });
}

/**
 * Phase 6: Get action items (incomplete notes with action types)
 */
export async function getActionItems(limit = 20) {
  return await db.activityNote.findMany({
    where: {
      actionType: {
        not: null,
      },
      completed: false,
    },
    include: {
      businessLead: true,
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  });
}

/**
 * Phase 6: Get notes by type
 */
export async function getNotesByType(
  type: 'note' | 'call' | 'email' | 'meeting' | 'follow-up',
  limit = 20
) {
  return await db.activityNote.findMany({
    where: {
      type,
    },
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
 * Phase 6: Get high priority notes
 */
export async function getHighPriorityNotes(limit = 20) {
  return await db.activityNote.findMany({
    where: {
      priority: {
        in: ['high', 'urgent'],
      },
      completed: false,
    },
    include: {
      businessLead: true,
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  });
}
