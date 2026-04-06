/**
 * Hook to fetch business lead data from API
 * Supports both in-memory state and server fetching
 */

import { useState, useEffect } from 'react';
import { useAppState } from './useAppState';
import type { BusinessLead } from '@/types';

export function useBusinessLead(id: string | undefined) {
  const { businesses } = useAppState();
  const [lead, setLead] = useState<BusinessLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    // First, try to find in in-memory state (from recent search)
    const inMemory = businesses.find(b => b.id === id);
    if (inMemory) {
      console.log('[useBusinessLead] Found in memory:', id);
      setLead(inMemory);
      setLoading(false);
      return;
    }

    // If not in memory, fetch from API
    console.log('[useBusinessLead] Fetching from API:', id);
    fetchLeadFromAPI(id);
  }, [id, businesses]);

  async function fetchLeadFromAPI(leadId: string) {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/leads/${leadId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Lead not found');
        } else {
          setError('Failed to load lead details');
        }
        setLead(null);
        return;
      }

      const data = await response.json();
      console.log('[useBusinessLead] Loaded from API:', data);
      setLead(data.data);
    } catch (err) {
      console.error('[useBusinessLead] Error:', err);
      setError('Failed to load lead details');
      setLead(null);
    } finally {
      setLoading(false);
    }
  }

  return { lead, loading, error, refetch: () => id && fetchLeadFromAPI(id) };
}
