/**
 * API Response Formatter
 * Phase 8: Enhanced API responses with UI-friendly metadata
 * Adds additional metadata to help frontend render better UX
 */

import { EnrichedBusinessLead, DomainOpportunity, SearchResult } from '../services/search-orchestrator';
import { DomainBusinessMatch } from '../services/business-matcher';

/**
 * Enhanced search result with UI metadata
 */
export interface UIEnhancedSearchResult extends SearchResult {
  uiMetadata: {
    // Summary stats for quick display
    summary: {
      totalResults: number;
      topProspects: number;
      immediateAction: number;
      contactableCount: number;
      availableDomainsCount: number;
      averageFitScore: number;
    };
    
    // Segmentation for UI tabs/filters
    segmentation: {
      byRanking: Record<string, number>;
      byAction: Record<string, number>;
      byContactability: {
        both: number;
        emailOnly: number;
        phoneOnly: number;
        neither: number;
      };
    };
    
    // Quick actions suggested
    quickActions: Array<{
      type: 'call' | 'email' | 'research' | 'save';
      count: number;
      label: string;
    }>;
    
    // Search performance
    performance: {
      executionTime: number;
      cacheHit: boolean;
      itemsPerSecond: number;
    };
  };
}

/**
 * Add UI metadata to search results
 */
export function enhanceSearchResultForUI(result: SearchResult): UIEnhancedSearchResult {
  const businesses = result.businesses || [];
  const domains = result.domains || [];
  
  // Calculate summary stats
  const topProspects = businesses.filter(b => 
    b.topBuyerScore && b.topBuyerScore >= 70
  ).length;
  
  const immediateAction = businesses.filter(b => 
    b.recommendedAction === 'immediate'
  ).length;
  
  const contactableCount = businesses.filter(b => 
    b.email || b.phone
  ).length;
  
  const availableDomainsCount = domains.filter(d => 
    d.status === 'available'
  ).length;
  
  const averageFitScore = businesses.reduce((sum, b) => 
    sum + (b.fitScore || 0), 0
  ) / (businesses.length || 1);
  
  // Segmentation by ranking
  const byRanking = businesses.reduce((acc, b) => {
    const ranking = b.ranking || 'standard';
    acc[ranking] = (acc[ranking] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Segmentation by action
  const byAction = businesses.reduce((acc, b) => {
    const action = b.recommendedAction || 'monitor';
    acc[action] = (acc[action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Contactability breakdown
  const byContactability = {
    both: businesses.filter(b => b.email && b.phone).length,
    emailOnly: businesses.filter(b => b.email && !b.phone).length,
    phoneOnly: businesses.filter(b => !b.email && b.phone).length,
    neither: businesses.filter(b => !b.email && !b.phone).length,
  };
  
  // Quick actions
  const quickActions = [
    {
      type: 'call' as const,
      count: businesses.filter(b => b.phone).length,
      label: 'Ready to Call',
    },
    {
      type: 'email' as const,
      count: businesses.filter(b => b.email).length,
      label: 'Ready to Email',
    },
    {
      type: 'research' as const,
      count: businesses.filter(b => b.website).length,
      label: 'Research Online',
    },
    {
      type: 'save' as const,
      count: topProspects,
      label: 'High Priority',
    },
  ].filter(action => action.count > 0);
  
  // Performance metrics
  const executionTime = result.metadata.executionTime;
  const totalItems = businesses.length + domains.length;
  const itemsPerSecond = totalItems / (executionTime / 1000);
  
  return {
    ...result,
    uiMetadata: {
      summary: {
        totalResults: businesses.length,
        topProspects,
        immediateAction,
        contactableCount,
        availableDomainsCount,
        averageFitScore: Math.round(averageFitScore),
      },
      segmentation: {
        byRanking,
        byAction,
        byContactability,
      },
      quickActions,
      performance: {
        executionTime,
        cacheHit: false, // Will be set by cache layer
        itemsPerSecond: Math.round(itemsPerSecond),
      },
    },
  };
}

/**
 * Format business for card display
 */
export interface UIBusinessCard {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  
  // Contact (formatted)
  contact: {
    phone: string | null;
    phoneFormatted: string | null;
    email: string | null;
    emailValid: boolean;
    website: string | null;
    websiteSecure: boolean;
  };
  
  // Scores (with colors)
  scores: {
    buyer: { value: number; color: string; label: string };
    topBuyer?: { value: number; color: string; label: string };
    contactReadiness?: { value: number; color: string; label: string };
    fit?: { value: number; color: string; label: string };
  };
  
  // Badges
  badges: {
    ranking?: { label: string; color: string; emoji: string };
    action?: { label: string; urgency: string; emoji: string };
  };
  
  // Recommendations
  recommendation?: {
    domain: string;
    alternatives: string[];
    pitchAngles: string[];
  };
  
  // Business info
  reputation: {
    rating: number;
    reviewCount: number;
    displayRating: string;
  };
}

/**
 * Format business for UI display
 */
export function formatBusinessForUI(business: EnrichedBusinessLead): UIBusinessCard {
  const getScoreFormat = (score: number | undefined) => {
    if (!score) return { value: 0, color: 'text-gray-400', label: 'N/A' };
    
    if (score >= 85) return { value: score, color: 'text-green-600', label: 'Excellent' };
    if (score >= 70) return { value: score, color: 'text-blue-600', label: 'Good' };
    if (score >= 50) return { value: score, color: 'text-yellow-600', label: 'Fair' };
    return { value: score, color: 'text-red-600', label: 'Poor' };
  };
  
  const formatPhone = (phone: string | undefined | null) => {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };
  
  return {
    id: business.id,
    name: business.name,
    address: business.address,
    city: business.city,
    state: business.state,
    
    contact: {
      phone: business.phone || null,
      phoneFormatted: formatPhone(business.phone),
      email: business.email || null,
      emailValid: business.email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.email) : false,
      website: business.website || null,
      websiteSecure: business.website ? business.website.startsWith('https://') : false,
    },
    
    scores: {
      buyer: getScoreFormat(business.buyerScore),
      topBuyer: business.topBuyerScore ? getScoreFormat(business.topBuyerScore) : undefined,
      contactReadiness: business.contactReadinessScore ? getScoreFormat(business.contactReadinessScore) : undefined,
      fit: business.fitScore ? getScoreFormat(business.fitScore) : undefined,
    },
    
    badges: {
      ranking: business.ranking ? {
        label: business.ranking.charAt(0).toUpperCase() + business.ranking.slice(1),
        color: business.ranking === 'platinum' ? 'purple' : business.ranking === 'gold' ? 'yellow' : 'gray',
        emoji: business.ranking === 'platinum' ? '💎' : business.ranking === 'gold' ? '🥇' : '⭐',
      } : undefined,
      action: business.recommendedAction ? {
        label: business.recommendedAction.charAt(0).toUpperCase() + business.recommendedAction.slice(1),
        urgency: business.recommendedAction === 'immediate' ? 'high' : business.recommendedAction === 'priority' ? 'medium' : 'low',
        emoji: business.recommendedAction === 'immediate' ? '🔥' : business.recommendedAction === 'priority' ? '⚡' : '📅',
      } : undefined,
    },
    
    recommendation: business.recommendedDomain ? {
      domain: business.recommendedDomain,
      alternatives: business.alternativeDomains || [],
      pitchAngles: business.pitchAngles || [],
    } : undefined,
    
    reputation: {
      rating: business.rating,
      reviewCount: business.reviewCount,
      displayRating: `${business.rating.toFixed(1)} ★ (${business.reviewCount} reviews)`,
    },
  };
}

/**
 * Format domain for UI display
 */
export interface UIDomainCard {
  domain: string;
  tld: string;
  status: string;
  statusBadge: {
    label: string;
    color: string;
    variant: 'default' | 'success' | 'warning' | 'destructive';
  };
  
  scores: {
    quality: { value: number; color: string; label: string };
    seo: { value: number; color: string; label: string };
    resale: { value: number; color: string; label: string };
    naturalness?: { value: number; color: string; label: string };
  };
  
  reasons: string[];
  
  pricing?: {
    estimated: string;
    range: { min: number; max: number };
  };
}

/**
 * Format domain for UI display
 */
export function formatDomainForUI(domain: DomainOpportunity): UIDomainCard {
  const getScoreFormat = (score: number) => {
    if (score >= 85) return { value: score, color: 'text-green-600', label: 'Excellent' };
    if (score >= 70) return { value: score, color: 'text-blue-600', label: 'Good' };
    if (score >= 50) return { value: score, color: 'text-yellow-600', label: 'Fair' };
    return { value: score, color: 'text-red-600', label: 'Poor' };
  };
  
  const getStatusBadge = (status: string) => {
    if (status === 'available') {
      return { label: 'Available', color: 'green', variant: 'success' as const };
    } else if (status === 'taken') {
      return { label: 'Taken', color: 'red', variant: 'destructive' as const };
    } else {
      return { label: 'Unknown', color: 'gray', variant: 'default' as const };
    }
  };
  
  const estimatePrice = (resaleScore: number) => {
    if (resaleScore >= 85) return { estimated: '$5K - $20K+', range: { min: 5000, max: 20000 } };
    if (resaleScore >= 70) return { estimated: '$2K - $10K', range: { min: 2000, max: 10000 } };
    if (resaleScore >= 50) return { estimated: '$500 - $5K', range: { min: 500, max: 5000 } };
    return { estimated: '$100 - $1K', range: { min: 100, max: 1000 } };
  };
  
  return {
    domain: domain.domain,
    tld: domain.tld,
    status: domain.status,
    statusBadge: getStatusBadge(domain.status),
    
    scores: {
      quality: getScoreFormat(domain.qualityScore),
      seo: getScoreFormat(domain.seoScore),
      resale: getScoreFormat(domain.resaleScore),
      naturalness: domain.naturalnessScore ? getScoreFormat(domain.naturalnessScore) : undefined,
    },
    
    reasons: domain.reasons,
    
    pricing: estimatePrice(domain.resaleScore),
  };
}
