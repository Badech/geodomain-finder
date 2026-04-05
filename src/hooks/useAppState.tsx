import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DomainOpportunity, BusinessLead, SearchQuery, ActivityNote, LeadStatus, SearchFilters, DEFAULT_FILTERS } from '@/types';

interface AppState {
  domains: DomainOpportunity[];
  businesses: BusinessLead[];
  searchHistory: SearchQuery[];
  savedDomains: DomainOpportunity[];
  activityNotes: ActivityNote[];
  filters: SearchFilters;
  isSearching: boolean;
  setDomains: (d: DomainOpportunity[]) => void;
  setBusinesses: (b: BusinessLead[]) => void;
  addSearchHistory: (q: SearchQuery) => void;
  toggleSaveDomain: (id: string) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  addNote: (businessId: string, content: string) => void;
  setFilters: (f: SearchFilters) => void;
  setIsSearching: (v: boolean) => void;
  updateBusiness: (id: string, updates: Partial<BusinessLead>) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [domains, setDomains] = useState<DomainOpportunity[]>([]);
  const [businesses, setBusinesses] = useState<BusinessLead[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchQuery[]>([]);
  const [activityNotes, setActivityNotes] = useState<ActivityNote[]>([]);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [isSearching, setIsSearching] = useState(false);

  const savedDomains = domains.filter(d => d.saved);

  const addSearchHistory = useCallback((q: SearchQuery) => {
    setSearchHistory(prev => [q, ...prev.slice(0, 9)]);
  }, []);

  const toggleSaveDomain = useCallback(async (id: string) => {
    // Optimistic update
    setDomains(prev => prev.map(d => d.id === id ? { ...d, saved: !d.saved } : d));
    
    // Persist to API
    try {
      await fetch(`/api/domains/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saved: true }), // API will toggle
      });
    } catch (error) {
      console.error('Failed to save domain:', error);
      // Revert on error
      setDomains(prev => prev.map(d => d.id === id ? { ...d, saved: !d.saved } : d));
    }
  }, []);

  const updateLeadStatus = useCallback(async (id: string, status: LeadStatus) => {
    // Optimistic update
    const previousBusinesses = businesses;
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    
    // Persist to API
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Failed to update lead status:', error);
      // Revert on error
      setBusinesses(previousBusinesses);
    }
  }, [businesses]);

  const addNote = useCallback(async (businessId: string, content: string) => {
    // Create optimistic note
    const note: ActivityNote = {
      id: `note-${Date.now()}`,
      businessLeadId: businessId,
      content,
      createdAt: new Date(),
    };
    setActivityNotes(prev => [note, ...prev]);
    
    // Persist to API
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessLeadId: businessId, content }),
      });
    } catch (error) {
      console.error('Failed to create note:', error);
      // Remove optimistic note on error
      setActivityNotes(prev => prev.filter(n => n.id !== note.id));
    }
  }, []);

  const updateBusiness = useCallback((id: string, updates: Partial<BusinessLead>) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  return (
    <AppContext.Provider value={{
      domains, businesses, searchHistory, savedDomains, activityNotes, filters, isSearching,
      setDomains, setBusinesses, addSearchHistory, toggleSaveDomain,
      updateLeadStatus, addNote, setFilters, setIsSearching, updateBusiness,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
