/**
 * Export Service
 * Phase 6 Task 6.8: CSV export for leads, opportunities, and notes
 */

import { EnrichedBusinessLead } from './search-orchestrator';
import { DomainOpportunity } from './search-orchestrator';
import { DomainBusinessMatch } from './business-matcher';

/**
 * Convert array to CSV string
 */
function arrayToCSV(data: any[], headers: string[]): string {
  const escapeValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = [headers.join(',')];
  
  for (const item of data) {
    const row = headers.map(header => {
      const value = item[header];
      return escapeValue(value);
    });
    rows.push(row.join(','));
  }
  
  return rows.join('\n');
}

/**
 * Export business leads to CSV
 */
export function exportLeadsToCSV(leads: EnrichedBusinessLead[]): string {
  const data = leads.map(lead => ({
    id: lead.id,
    name: lead.name,
    niche: lead.niche,
    city: lead.city,
    state: lead.state,
    phone: lead.phone || '',
    email: lead.email || '',
    website: lead.website || '',
    address: lead.address,
    rating: lead.rating,
    reviewCount: lead.reviewCount,
    currentDomain: lead.currentDomain || '',
    buyerScore: lead.buyerScore,
    status: lead.status || 'new',
    // Phase 6 fields
    topBuyerScore: lead.topBuyerScore || '',
    contactReadinessScore: lead.contactReadinessScore || '',
    ranking: lead.ranking || '',
    recommendedAction: lead.recommendedAction || '',
    recommendedDomain: lead.recommendedDomain || '',
    fitScore: lead.fitScore || '',
    // Current domain analysis
    currentDomainWeaknesses: lead.currentDomainAnalysis?.weaknesses.join('; ') || '',
    currentDomainScore: lead.currentDomainAnalysis?.overallScore || '',
    // Pitch angles
    pitchAngles: lead.pitchAngles?.join('; ') || '',
  }));

  const headers = [
    'id', 'name', 'niche', 'city', 'state', 
    'phone', 'email', 'website', 'address',
    'rating', 'reviewCount', 'currentDomain', 
    'buyerScore', 'status',
    'topBuyerScore', 'contactReadinessScore', 'ranking', 
    'recommendedAction', 'recommendedDomain', 'fitScore',
    'currentDomainWeaknesses', 'currentDomainScore', 'pitchAngles'
  ];

  return arrayToCSV(data, headers);
}

/**
 * Export domains to CSV
 */
export function exportDomainsToCSV(domains: DomainOpportunity[]): string {
  const data = domains.map(domain => ({
    domain: domain.domain,
    tld: domain.tld,
    status: domain.status,
    qualityScore: domain.qualityScore,
    seoScore: domain.seoScore,
    resaleScore: domain.resaleScore,
    naturalnessScore: domain.naturalnessScore || '',
    reasons: domain.reasons.join('; '),
    pattern: domain.pattern || '',
    availabilitySource: domain.availabilitySource || '',
    checkedAt: domain.availabilityCheckedAt?.toISOString() || '',
  }));

  const headers = [
    'domain', 'tld', 'status', 
    'qualityScore', 'seoScore', 'resaleScore', 'naturalnessScore',
    'reasons', 'pattern', 'availabilitySource', 'checkedAt'
  ];

  return arrayToCSV(data, headers);
}

/**
 * Export opportunities (matches) to CSV
 */
export function exportOpportunitiesToCSV(matches: DomainBusinessMatch[]): string {
  const data = matches.map(match => ({
    businessName: match.businessName,
    domain: match.domain,
    fitScore: match.fitScore,
    matchReason: match.matchReason,
    reasons: match.reasons.join('; '),
    alternativeDomains: match.alternativeDomains?.join('; ') || '',
    currentDomain: match.currentDomainAnalysis?.domain || '',
    currentDomainScore: match.currentDomainAnalysis?.overallScore || '',
    currentDomainWeaknesses: match.currentDomainAnalysis?.weaknesses.join('; ') || '',
  }));

  const headers = [
    'businessName', 'domain', 'fitScore', 'matchReason', 'reasons',
    'alternativeDomains', 'currentDomain', 'currentDomainScore', 
    'currentDomainWeaknesses'
  ];

  return arrayToCSV(data, headers);
}

/**
 * Export notes to CSV
 */
export function exportNotesToCSV(notes: any[]): string {
  const data = notes.map(note => ({
    id: note.id,
    businessName: note.businessLead?.name || '',
    content: note.content,
    type: note.type || 'note',
    actionType: note.actionType || '',
    priority: note.priority || 'normal',
    completed: note.completed || false,
    followUpDate: note.followUpDate?.toISOString() || '',
    createdAt: note.createdAt?.toISOString() || '',
    updatedAt: note.updatedAt?.toISOString() || '',
  }));

  const headers = [
    'id', 'businessName', 'content', 'type', 'actionType',
    'priority', 'completed', 'followUpDate', 'createdAt', 'updatedAt'
  ];

  return arrayToCSV(data, headers);
}

/**
 * Export full search results to CSV (combined)
 */
export function exportSearchResultsToCSV(
  leads: EnrichedBusinessLead[],
  domains: DomainOpportunity[],
  matches: DomainBusinessMatch[]
): {
  leadsCSV: string;
  domainsCSV: string;
  matchesCSV: string;
} {
  return {
    leadsCSV: exportLeadsToCSV(leads),
    domainsCSV: exportDomainsToCSV(domains),
    matchesCSV: exportOpportunitiesToCSV(matches),
  };
}

/**
 * Generate filename with timestamp
 */
export function generateExportFilename(type: 'leads' | 'domains' | 'matches' | 'notes'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `geodomain-scout-${type}-${timestamp}.csv`;
}
