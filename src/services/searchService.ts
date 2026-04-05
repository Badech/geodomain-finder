import { DomainOpportunity, BusinessLead } from '@/types';

/**
 * Search Service - Real API Integration
 * Replaces mock implementation with actual backend calls
 */

const API_BASE = '/api';

export interface SearchResult {
  searchQueryId: string;
  domains: DomainOpportunity[];
  businesses: BusinessLead[];
  matches: any[];
  metadata: {
    totalDomains: number;
    availableDomains: number;
    totalBusinesses: number;
    totalMatches: number;
    executionTime: number;
  };
}

/**
 * Execute complete search via API
 */
export async function executeSearch(
  niche: string,
  state: string,
  city: string
): Promise<SearchResult> {
  try {
    const response = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        niche,
        city,
        state,
        maxDomains: 20,
        maxBusinesses: 20,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Search failed');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Search API error:', error);
    throw error;
  }
}

/**
 * Search domains only (for backward compatibility)
 */
export async function searchDomains(
  niche: string,
  state: string,
  city: string
): Promise<DomainOpportunity[]> {
  const result = await executeSearch(niche, state, city);
  return result.domains;
}

/**
 * Search businesses only (for backward compatibility)
 */
export async function searchBusinesses(
  niche: string,
  state: string,
  city: string
): Promise<BusinessLead[]> {
  const result = await executeSearch(niche, state, city);
  return result.businesses;
}

/**
 * List saved domains
 */
export async function getSavedDomains(): Promise<DomainOpportunity[]> {
  try {
    const response = await fetch(`${API_BASE}/domains?saved=true&limit=100`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch saved domains');
    }

    const result = await response.json();
    return result.data.domains;
  } catch (error) {
    console.error('Get saved domains error:', error);
    return [];
  }
}

/**
 * Toggle domain saved status
 */
export async function toggleDomainSaved(domainId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/domains/${domainId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        saved: true, // The API will toggle it
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update domain');
    }
  } catch (error) {
    console.error('Toggle domain saved error:', error);
    throw error;
  }
}

/**
 * Get lead details
 */
export async function getLeadDetails(leadId: string): Promise<BusinessLead | null> {
  try {
    const response = await fetch(`${API_BASE}/leads/${leadId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch lead details');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Get lead details error:', error);
    return null;
  }
}

/**
 * Update lead status
 */
export async function updateLeadStatus(
  leadId: string,
  status: 'new' | 'saved' | 'contacted' | 'interested' | 'follow-up' | 'closed'
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/leads/${leadId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update lead status');
    }
  } catch (error) {
    console.error('Update lead status error:', error);
    throw error;
  }
}

/**
 * Create activity note
 */
export async function createNote(leadId: string, content: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessLeadId: leadId,
        content,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create note');
    }
  } catch (error) {
    console.error('Create note error:', error);
    throw error;
  }
}

/**
 * Get notes for a lead
 */
export async function getLeadNotes(leadId: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/notes?businessLeadId=${leadId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }

    const result = await response.json();
    return result.data.notes;
  } catch (error) {
    console.error('Get lead notes error:', error);
    return [];
  }
}

/**
 * Get opportunities (matches)
 */
export async function getOpportunities(minFitScore = 50): Promise<any[]> {
  try {
    const response = await fetch(
      `${API_BASE}/opportunities?minFitScore=${minFitScore}&limit=100&sortBy=fitScore&sortOrder=desc`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch opportunities');
    }

    const result = await response.json();
    return result.data.opportunities;
  } catch (error) {
    console.error('Get opportunities error:', error);
    return [];
  }
}
