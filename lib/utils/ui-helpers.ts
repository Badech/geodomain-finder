/**
 * UI Helper Utilities
 * Phase 8: Backend support for better UX
 * Provides formatted data and helper functions for frontend components
 */

import { EnrichedBusinessLead } from '../services/search-orchestrator';
import { DomainOpportunity } from '../services/search-orchestrator';

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return as-is for other formats
  return phone;
}

/**
 * Format email for display with validation status
 */
export function formatEmail(email: string | null | undefined): {
  display: string;
  isValid: boolean;
  mailto: string;
} {
  if (!email) {
    return { display: '', isValid: false, mailto: '' };
  }
  
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  return {
    display: email,
    isValid,
    mailto: `mailto:${email}`,
  };
}

/**
 * Format website URL for display and clicking
 */
export function formatWebsite(website: string | null | undefined): {
  display: string;
  href: string;
  isSecure: boolean;
} {
  if (!website) {
    return { display: '', href: '', isSecure: false };
  }
  
  // Ensure URL has protocol
  let url = website;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  
  const isSecure = url.startsWith('https://');
  
  // Clean display (remove protocol)
  const display = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  return {
    display,
    href: url,
    isSecure,
  };
}

/**
 * Get badge color/variant based on ranking
 */
export function getRankingBadge(ranking: 'platinum' | 'gold' | 'silver' | 'bronze' | 'standard' | undefined): {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  color: string;
  label: string;
  emoji: string;
} {
  switch (ranking) {
    case 'platinum':
      return { variant: 'default', color: 'bg-purple-500', label: 'Platinum', emoji: '💎' };
    case 'gold':
      return { variant: 'default', color: 'bg-yellow-500', label: 'Gold', emoji: '🥇' };
    case 'silver':
      return { variant: 'secondary', color: 'bg-gray-400', label: 'Silver', emoji: '🥈' };
    case 'bronze':
      return { variant: 'outline', color: 'bg-orange-600', label: 'Bronze', emoji: '🥉' };
    default:
      return { variant: 'outline', color: 'bg-gray-300', label: 'Standard', emoji: '⭐' };
  }
}

/**
 * Get action badge styling
 */
export function getActionBadge(action: 'immediate' | 'priority' | 'follow-up' | 'monitor' | undefined): {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  label: string;
  emoji: string;
  urgency: 'high' | 'medium' | 'low';
} {
  switch (action) {
    case 'immediate':
      return { variant: 'destructive', label: 'Immediate', emoji: '🔥', urgency: 'high' };
    case 'priority':
      return { variant: 'default', label: 'Priority', emoji: '⚡', urgency: 'high' };
    case 'follow-up':
      return { variant: 'secondary', label: 'Follow-up', emoji: '📅', urgency: 'medium' };
    default:
      return { variant: 'outline', label: 'Monitor', emoji: '👀', urgency: 'low' };
  }
}

/**
 * Get score color class based on value
 */
export function getScoreColor(score: number): {
  color: string;
  textColor: string;
  bgColor: string;
  label: string;
} {
  if (score >= 85) {
    return {
      color: 'text-green-600',
      textColor: 'text-green-700',
      bgColor: 'bg-green-100',
      label: 'Excellent',
    };
  } else if (score >= 70) {
    return {
      color: 'text-blue-600',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-100',
      label: 'Good',
    };
  } else if (score >= 50) {
    return {
      color: 'text-yellow-600',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      label: 'Fair',
    };
  } else {
    return {
      color: 'text-red-600',
      textColor: 'text-red-700',
      bgColor: 'bg-red-100',
      label: 'Poor',
    };
  }
}

/**
 * Format score with color and label
 */
export function formatScore(score: number | undefined): {
  value: string;
  color: string;
  label: string;
  percentage: number;
} {
  if (score === undefined || score === null) {
    return { value: 'N/A', color: 'text-gray-400', label: 'Unknown', percentage: 0 };
  }
  
  const colors = getScoreColor(score);
  
  return {
    value: score.toFixed(0),
    color: colors.color,
    label: colors.label,
    percentage: score,
  };
}

/**
 * Get copyable text for a business
 */
export function getCopyableBusinessInfo(lead: EnrichedBusinessLead): {
  name: string;
  contact: string;
  full: string;
} {
  const parts = [
    lead.name,
    lead.address,
    lead.phone ? `Phone: ${formatPhoneNumber(lead.phone)}` : null,
    lead.email ? `Email: ${lead.email}` : null,
    lead.website ? `Website: ${lead.website}` : null,
  ].filter(Boolean);
  
  const contactParts = [
    lead.phone ? formatPhoneNumber(lead.phone) : null,
    lead.email,
  ].filter(Boolean);
  
  return {
    name: lead.name,
    contact: contactParts.join(' • '),
    full: parts.join('\n'),
  };
}

/**
 * Get tooltip content for a score
 */
export function getScoreTooltip(
  type: 'buyer' | 'topBuyer' | 'contactReadiness' | 'fit' | 'domain',
  score: number,
  reasons?: string[]
): {
  title: string;
  description: string;
  reasons: string[];
} {
  const tooltips = {
    buyer: {
      title: 'Buyer Score',
      description: 'Likelihood to purchase a premium domain based on current situation',
    },
    topBuyer: {
      title: 'Top Buyer Score',
      description: 'Overall prospect quality considering domain weakness and business strength',
    },
    contactReadiness: {
      title: 'Contact Readiness',
      description: 'How easy it is to reach and pitch this prospect',
    },
    fit: {
      title: 'Fit Score',
      description: 'How well this domain matches the business needs',
    },
    domain: {
      title: 'Domain Quality',
      description: 'Overall domain quality for SEO, branding, and resale',
    },
  };
  
  const tooltip = tooltips[type];
  
  return {
    title: tooltip.title,
    description: `${tooltip.description} (${score}/100)`,
    reasons: reasons || [],
  };
}

/**
 * Format currency (for resale estimates)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Estimate domain resale value based on score
 */
export function estimateResaleValue(resaleScore: number): {
  min: number;
  max: number;
  formatted: string;
} {
  if (resaleScore >= 85) {
    return { min: 5000, max: 20000, formatted: '$5,000 - $20,000+' };
  } else if (resaleScore >= 70) {
    return { min: 2000, max: 10000, formatted: '$2,000 - $10,000' };
  } else if (resaleScore >= 50) {
    return { min: 500, max: 5000, formatted: '$500 - $5,000' };
  } else {
    return { min: 100, max: 1000, formatted: '$100 - $1,000' };
  }
}

/**
 * Format relative time (for notes, searches, etc.)
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return then.toLocaleDateString();
}

/**
 * Generate search progress messages
 */
export function getProgressMessage(stage: string, progress: number): {
  message: string;
  emoji: string;
} {
  const messages: Record<string, { message: string; emoji: string }> = {
    validating: { message: 'Validating search parameters...', emoji: '🔍' },
    generating: { message: 'Generating domain suggestions...', emoji: '💡' },
    checking: { message: 'Checking domain availability...', emoji: '🌐' },
    searching: { message: 'Finding local businesses...', emoji: '📍' },
    enriching: { message: 'Enriching prospect data...', emoji: '✨' },
    matching: { message: 'Matching domains to businesses...', emoji: '🎯' },
    persisting: { message: 'Saving results...', emoji: '💾' },
    complete: { message: 'Search complete!', emoji: '✅' },
  };
  
  return messages[stage] || { message: 'Processing...', emoji: '⏳' };
}

/**
 * Get empty state message based on context
 */
export function getEmptyStateMessage(context: 'search' | 'leads' | 'domains' | 'opportunities' | 'notes'): {
  title: string;
  description: string;
  action: string;
  emoji: string;
} {
  const messages = {
    search: {
      title: 'No Results Found',
      description: 'Try adjusting your search criteria or exploring a different niche and location',
      action: 'New Search',
      emoji: '🔍',
    },
    leads: {
      title: 'No Leads Yet',
      description: 'Start a search to discover local business prospects in your target market',
      action: 'Search Now',
      emoji: '📊',
    },
    domains: {
      title: 'No Domains Available',
      description: 'Run a search to generate geo-targeted domain opportunities',
      action: 'Generate Domains',
      emoji: '🌐',
    },
    opportunities: {
      title: 'No Matches Found',
      description: 'Search for businesses to find domain-to-prospect matching opportunities',
      action: 'Find Opportunities',
      emoji: '🎯',
    },
    notes: {
      title: 'No Notes',
      description: 'Add notes to track your outreach and follow-ups',
      action: 'Add Note',
      emoji: '📝',
    },
  };
  
  return messages[context];
}
