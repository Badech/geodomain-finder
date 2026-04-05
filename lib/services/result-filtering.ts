/**
 * Result Filtering Service
 * Phase 6 Task 6.7: Implement better filtering for search results
 */

import { EnrichedBusinessLead } from './search-orchestrator';
import { DomainOpportunity } from './search-orchestrator';

export interface FilterOptions {
  // Domain filters
  comOnly?: boolean;
  minDomainScore?: number;
  minSeoScore?: number;
  onlyAvailable?: boolean;
  excludeLongDomains?: boolean; // > 20 chars
  
  // Business filters
  minBuyerScore?: number;
  minRating?: number;
  minReviewCount?: number;
  onlyWithWebsite?: boolean;
  onlyWithPhone?: boolean;
  onlyWithEmail?: boolean;
  onlyWeakCurrentDomains?: boolean; // currentDomainAnalysis score < 50
  
  // Match filters
  minFitScore?: number;
  onlyHighFitOpportunities?: boolean; // fitScore >= 70
  onlyMissingGeoService?: boolean; // Businesses without geo-service match in current domain
  
  // Phase 6 filters
  minTopBuyerScore?: number;
  minContactReadinessScore?: number;
  rankingFilter?: 'platinum' | 'gold' | 'silver' | 'bronze';
  recommendedActionFilter?: 'immediate' | 'priority' | 'follow-up';
}

/**
 * Filter domains based on criteria
 */
export function filterDomains(
  domains: DomainOpportunity[],
  filters: FilterOptions
): DomainOpportunity[] {
  let filtered = [...domains];
  
  // Only .com domains
  if (filters.comOnly) {
    filtered = filtered.filter(d => d.tld === '.com');
  }
  
  // Minimum domain quality score
  if (filters.minDomainScore !== undefined) {
    filtered = filtered.filter(d => d.qualityScore >= filters.minDomainScore!);
  }
  
  // Minimum SEO score
  if (filters.minSeoScore !== undefined) {
    filtered = filtered.filter(d => d.seoScore >= filters.minSeoScore!);
  }
  
  // Only available domains
  if (filters.onlyAvailable) {
    filtered = filtered.filter(d => d.status === 'available');
  }
  
  // Exclude long domains
  if (filters.excludeLongDomains) {
    filtered = filtered.filter(d => {
      const domainName = d.domain.replace(/\.[a-z]{2,}$/, '');
      return domainName.length <= 20;
    });
  }
  
  return filtered;
}

/**
 * Filter businesses based on criteria
 */
export function filterBusinesses(
  businesses: EnrichedBusinessLead[],
  filters: FilterOptions
): EnrichedBusinessLead[] {
  let filtered = [...businesses];
  
  // Minimum buyer score
  if (filters.minBuyerScore !== undefined) {
    filtered = filtered.filter(b => b.buyerScore >= filters.minBuyerScore!);
  }
  
  // Minimum rating
  if (filters.minRating !== undefined) {
    filtered = filtered.filter(b => b.rating >= filters.minRating!);
  }
  
  // Minimum review count
  if (filters.minReviewCount !== undefined) {
    filtered = filtered.filter(b => b.reviewCount >= filters.minReviewCount!);
  }
  
  // Only with website
  if (filters.onlyWithWebsite) {
    filtered = filtered.filter(b => b.website);
  }
  
  // Only with phone
  if (filters.onlyWithPhone) {
    filtered = filtered.filter(b => b.phone);
  }
  
  // Only with email
  if (filters.onlyWithEmail) {
    filtered = filtered.filter(b => b.email);
  }
  
  // Only weak current domains
  if (filters.onlyWeakCurrentDomains) {
    filtered = filtered.filter(b => {
      if (!b.currentDomainAnalysis) return false;
      return b.currentDomainAnalysis.overallScore < 50;
    });
  }
  
  // Only high fit opportunities
  if (filters.onlyHighFitOpportunities) {
    filtered = filtered.filter(b => b.fitScore && b.fitScore >= 70);
  }
  
  // Minimum fit score
  if (filters.minFitScore !== undefined) {
    filtered = filtered.filter(b => b.fitScore && b.fitScore >= filters.minFitScore!);
  }
  
  // Only missing geo-service match
  if (filters.onlyMissingGeoService) {
    filtered = filtered.filter(b => {
      if (!b.currentDomainAnalysis) return true; // No domain = missing
      const weaknesses = b.currentDomainAnalysis.weaknesses;
      return weaknesses.includes('No geographic keywords (city or state)') ||
             weaknesses.includes('Missing service/niche keyword');
    });
  }
  
  // Phase 6: Top buyer score filter
  if (filters.minTopBuyerScore !== undefined) {
    filtered = filtered.filter(b => b.topBuyerScore && b.topBuyerScore >= filters.minTopBuyerScore!);
  }
  
  // Phase 6: Contact readiness filter
  if (filters.minContactReadinessScore !== undefined) {
    filtered = filtered.filter(b => 
      b.contactReadinessScore && b.contactReadinessScore >= filters.minContactReadinessScore!
    );
  }
  
  // Phase 6: Ranking filter
  if (filters.rankingFilter) {
    const rankingOrder = ['platinum', 'gold', 'silver', 'bronze', 'standard'];
    const minRankIndex = rankingOrder.indexOf(filters.rankingFilter);
    filtered = filtered.filter(b => {
      if (!b.ranking) return false;
      const businessRankIndex = rankingOrder.indexOf(b.ranking);
      return businessRankIndex <= minRankIndex;
    });
  }
  
  // Phase 6: Recommended action filter
  if (filters.recommendedActionFilter) {
    const actionOrder = ['immediate', 'priority', 'follow-up', 'monitor'];
    const maxActionIndex = actionOrder.indexOf(filters.recommendedActionFilter);
    filtered = filtered.filter(b => {
      if (!b.recommendedAction) return false;
      const businessActionIndex = actionOrder.indexOf(b.recommendedAction);
      return businessActionIndex <= maxActionIndex;
    });
  }
  
  return filtered;
}

/**
 * Apply all filters to search results
 */
export function applyFilters(
  domains: DomainOpportunity[],
  businesses: EnrichedBusinessLead[],
  filters: FilterOptions
): {
  filteredDomains: DomainOpportunity[];
  filteredBusinesses: EnrichedBusinessLead[];
} {
  return {
    filteredDomains: filterDomains(domains, filters),
    filteredBusinesses: filterBusinesses(businesses, filters),
  };
}

/**
 * Get filter summary for UI display
 */
export function getFilterSummary(filters: FilterOptions): string[] {
  const summary: string[] = [];
  
  if (filters.comOnly) summary.push('.com domains only');
  if (filters.minDomainScore) summary.push(`Min domain score: ${filters.minDomainScore}`);
  if (filters.onlyAvailable) summary.push('Available domains only');
  if (filters.minBuyerScore) summary.push(`Min buyer score: ${filters.minBuyerScore}`);
  if (filters.minRating) summary.push(`Min rating: ${filters.minRating}★`);
  if (filters.onlyWithEmail) summary.push('Email required');
  if (filters.onlyWithPhone) summary.push('Phone required');
  if (filters.onlyWeakCurrentDomains) summary.push('Weak domains only');
  if (filters.onlyHighFitOpportunities) summary.push('High fit only');
  if (filters.minTopBuyerScore) summary.push(`Min top buyer score: ${filters.minTopBuyerScore}`);
  if (filters.rankingFilter) summary.push(`${filters.rankingFilter}+ prospects`);
  if (filters.recommendedActionFilter) summary.push(`${filters.recommendedActionFilter} action`);
  
  return summary;
}
