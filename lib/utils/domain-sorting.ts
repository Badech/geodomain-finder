/**
 * Domain sorting and filtering utilities
 * Ensures available domains are shown first, taken domains last
 */

import type { DomainOpportunity } from '@/types';

/**
 * Status priority for sorting (lower number = higher priority)
 */
const STATUS_PRIORITY: Record<string, number> = {
  'available': 1,
  'premium': 2,
  'unknown': 3,
  'error': 4,
  'taken': 5,
  'invalid': 6,
};

/**
 * Sort domains by status priority, then by quality score
 * Available domains appear first, taken domains last
 */
export function sortDomainsByPriority(domains: DomainOpportunity[]): DomainOpportunity[] {
  return [...domains].sort((a, b) => {
    // First, sort by status priority
    const statusA = STATUS_PRIORITY[a.status] || 99;
    const statusB = STATUS_PRIORITY[b.status] || 99;
    
    if (statusA !== statusB) {
      return statusA - statusB;
    }
    
    // Within same status, sort by quality score (descending)
    return b.qualityScore - a.qualityScore;
  });
}

/**
 * Get summary counts by status
 */
export function getDomainStatusCounts(domains: DomainOpportunity[]) {
  return {
    available: domains.filter(d => d.status === 'available').length,
    premium: domains.filter(d => d.status === 'premium').length,
    taken: domains.filter(d => d.status === 'taken').length,
    unknown: domains.filter(d => d.status === 'unknown' || d.status === 'error').length,
    total: domains.length,
  };
}

/**
 * Filter domains to show only useful opportunities
 * Hides taken domains by default unless there are no other options
 */
export function getUsefulDomainOpportunities(
  domains: DomainOpportunity[],
  options?: { showTaken?: boolean; minQualityScore?: number }
): DomainOpportunity[] {
  const { showTaken = false, minQualityScore = 0 } = options || {};
  
  let filtered = domains.filter(d => d.qualityScore >= minQualityScore);
  
  if (!showTaken) {
    const nonTaken = filtered.filter(d => d.status !== 'taken');
    // Only show taken domains if there are no other results
    if (nonTaken.length > 0) {
      filtered = nonTaken;
    }
  }
  
  return sortDomainsByPriority(filtered);
}

/**
 * Check if domain list is useful (has available or premium domains)
 */
export function hasUsefulDomains(domains: DomainOpportunity[]): boolean {
  return domains.some(d => d.status === 'available' || d.status === 'premium');
}
