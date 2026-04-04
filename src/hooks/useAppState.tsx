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

  const toggleSaveDomain = useCallback((id: string) => {
    setDomains(prev => prev.map(d => d.id === id ? { ...d, saved: !d.saved } : d));
  }, []);

  const updateLeadStatus = useCallback((id: string, status: LeadStatus) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }, []);

  const addNote = useCallback((businessId: string, content: string) => {
    const note: ActivityNote = {
      id: `note-${Date.now()}`,
      businessLeadId: businessId,
      content,
      createdAt: new Date(),
    };
    setActivityNotes(prev => [note, ...prev]);
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
