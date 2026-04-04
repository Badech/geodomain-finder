export interface SearchQuery {
  id: string;
  niche: string;
  state: string;
  city: string;
  modifiers: string[];
  createdAt: Date;
}

export type DomainStatus = 'available' | 'taken' | 'unknown';

export interface DomainOpportunity {
  id: string;
  domain: string;
  tld: string;
  status: DomainStatus;
  qualityScore: number;
  seoScore: number;
  resaleScore: number;
  reasons: string[];
  searchQueryId: string;
  saved: boolean;
}

export type LeadStatus = 'new' | 'saved' | 'contacted' | 'interested' | 'follow-up' | 'closed';

export interface BusinessLead {
  id: string;
  name: string;
  niche: string;
  city: string;
  state: string;
  phone: string;
  email?: string;
  website?: string;
  address: string;
  rating: number;
  reviewCount: number;
  currentDomain?: string;
  buyerScore: number;
  notes: string;
  status: LeadStatus;
  tags: string[];
  recommendedDomainId?: string;
  recommendedDomain?: string;
  matchReason?: string;
}

export interface ActivityNote {
  id: string;
  businessLeadId: string;
  content: string;
  createdAt: Date;
}

export interface SearchFilters {
  comOnly: boolean;
  minQualityScore: number;
  excludeLongDomains: boolean;
  includeVariants: boolean;
  minReviewCount: number;
  onlyWeakDomains: boolean;
  onlyWithWebsite: boolean;
  onlyWithPhone: boolean;
  onlyWithEmail: boolean;
}

export const DEFAULT_FILTERS: SearchFilters = {
  comOnly: true,
  minQualityScore: 0,
  excludeLongDomains: false,
  includeVariants: true,
  minReviewCount: 0,
  onlyWeakDomains: false,
  onlyWithWebsite: false,
  onlyWithPhone: false,
  onlyWithEmail: false,
};
