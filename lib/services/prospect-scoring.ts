/**
 * Prospect Scoring Service
 * Enhanced scoring for identifying top buyers and contact readiness
 */

import { ScoredBusinessLead, CurrentDomainAnalysis } from './business-matcher';

export interface TopBuyerScore {
  businessLeadId: string;
  businessName: string;
  topBuyerScore: number; // 0-100, higher = better prospect
  buyerScore: number; // Original buyer score
  contactReadinessScore: number; // 0-100, higher = easier to contact
  ranking: 'platinum' | 'gold' | 'silver' | 'bronze' | 'standard';
  topBuyerReasons: string[];
  contactReadinessReasons: string[];
  recommendedAction: 'immediate' | 'priority' | 'follow-up' | 'monitor';
  pitchAngles: string[];
}

export interface ProspectAnalysis extends TopBuyerScore {
  lead: ScoredBusinessLead;
  currentDomainAnalysis?: CurrentDomainAnalysis;
}

/**
 * Calculate Top Buyer Score
 * Identifies businesses most likely to purchase a premium domain
 */
export function calculateTopBuyerScore(
  lead: ScoredBusinessLead,
  currentDomainAnalysis?: CurrentDomainAnalysis
): number {
  let score = 0;
  
  // 1. Weak current domain = high opportunity (30 points max)
  if (currentDomainAnalysis) {
    const weaknessScore = 100 - currentDomainAnalysis.overallScore;
    score += (weaknessScore / 100) * 30;
  } else if (!lead.website) {
    score += 30; // No website = maximum opportunity
  }
  
  // 2. Strong reviews / established business (25 points max)
  if (lead.reviewCount >= 200) {
    score += 25;
  } else if (lead.reviewCount >= 100) {
    score += 20;
  } else if (lead.reviewCount >= 50) {
    score += 15;
  } else if (lead.reviewCount >= 20) {
    score += 10;
  }
  
  if (lead.rating >= 4.5 && lead.reviewCount >= 50) {
    score += 5; // Bonus for excellent established business
  }
  
  // 3. Strong local presence (15 points max)
  if (lead.rating >= 4.5) {
    score += 10;
  } else if (lead.rating >= 4.0) {
    score += 7;
  } else if (lead.rating >= 3.5) {
    score += 5;
  }
  
  if (lead.address && lead.phone) {
    score += 5; // Has physical presence
  }
  
  // 4. Public contactability (15 points max)
  if (lead.email && lead.phone) {
    score += 15;
  } else if (lead.email || lead.phone) {
    score += 10;
  }
  
  // 5. Original buyer score factor (15 points max)
  score += (lead.buyerScore / 100) * 15;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate Contact Readiness Score
 * Measures how easy it is to contact and pitch this prospect
 */
export function calculateContactReadinessScore(lead: ScoredBusinessLead): {
  score: number;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];
  
  // Phone availability (30 points)
  if (lead.phone) {
    score += 30;
    reasons.push('✓ Phone number available');
  } else {
    reasons.push('✗ No phone number');
  }
  
  // Email availability (30 points)
  if (lead.email) {
    score += 30;
    reasons.push('✓ Email address found');
  } else {
    reasons.push('✗ No email address');
  }
  
  // Website presence (20 points)
  if (lead.website) {
    score += 20;
    reasons.push('✓ Has website for research');
  } else {
    reasons.push('✗ No website');
  }
  
  // Business presence indicators (20 points)
  if (lead.reviewCount >= 20) {
    score += 10;
    reasons.push('✓ Active business with reviews');
  }
  
  if (lead.rating >= 4.0) {
    score += 10;
    reasons.push('✓ Good reputation');
  }
  
  return { score: Math.min(100, Math.max(0, score)), reasons };
}

/**
 * Generate recommended pitch angles based on business characteristics
 */
export function generatePitchAngles(
  lead: ScoredBusinessLead,
  currentDomainAnalysis?: CurrentDomainAnalysis
): string[] {
  const pitchAngles: string[] = [];
  
  // Based on current domain weaknesses
  if (currentDomainAnalysis) {
    if (currentDomainAnalysis.weaknesses.includes('No geographic keywords (city or state)')) {
      pitchAngles.push('Boost local SEO with geo-targeted domain');
      pitchAngles.push('Show up when customers search "[service] near me"');
    }
    
    if (currentDomainAnalysis.weaknesses.includes('Missing service/niche keyword')) {
      pitchAngles.push('Make your service instantly clear in search results');
    }
    
    if (currentDomainAnalysis.weaknesses.includes('Too long - hard to remember')) {
      pitchAngles.push('Easier to remember = more word-of-mouth referrals');
      pitchAngles.push('Shorter domain looks more professional on business cards');
    }
    
    if (currentDomainAnalysis.weaknesses.includes('Not a .com domain')) {
      pitchAngles.push('Premium .com builds instant credibility and trust');
    }
    
    if (currentDomainAnalysis.weaknesses.includes('Contains hyphens or numbers')) {
      pitchAngles.push('Clean domain is easier for customers to type and share');
    }
  }
  
  // Based on business characteristics
  if (!lead.website) {
    pitchAngles.push('Establish professional online presence instantly');
    pitchAngles.push('Capture customers searching online for your services');
  }
  
  const websiteLower = lead.website?.toLowerCase() || '';
  if (websiteLower.includes('wixsite.com') || websiteLower.includes('weebly.com')) {
    pitchAngles.push('Upgrade from free subdomain to professional custom domain');
    pitchAngles.push('Own your brand - not dependent on third-party platform');
  }
  
  if (lead.rating >= 4.5 && lead.reviewCount >= 50) {
    pitchAngles.push('Your excellent reputation deserves a premium domain');
    pitchAngles.push('Stand out from competitors with memorable branding');
  }
  
  if (lead.reviewCount >= 100) {
    pitchAngles.push('Perfect timing - leverage existing customer base with better domain');
  }
  
  // Geographic and service relevance
  pitchAngles.push('Dominate local search with city-service domain match');
  pitchAngles.push('Ideal for Google Ads and local landing pages');
  
  return pitchAngles.slice(0, 5); // Return top 5 most relevant
}

/**
 * Determine recommended action based on scores
 */
export function determineRecommendedAction(
  topBuyerScore: number,
  contactReadinessScore: number
): 'immediate' | 'priority' | 'follow-up' | 'monitor' {
  if (topBuyerScore >= 80 && contactReadinessScore >= 70) {
    return 'immediate'; // High priority, easy to contact
  }
  
  if (topBuyerScore >= 70 || (topBuyerScore >= 60 && contactReadinessScore >= 80)) {
    return 'priority'; // Good prospect or very contactable
  }
  
  if (topBuyerScore >= 50 || contactReadinessScore >= 60) {
    return 'follow-up'; // Worth pursuing
  }
  
  return 'monitor'; // Lower priority
}

/**
 * Assign ranking tier based on top buyer score
 */
export function assignRanking(topBuyerScore: number): 'platinum' | 'gold' | 'silver' | 'bronze' | 'standard' {
  if (topBuyerScore >= 85) return 'platinum';
  if (topBuyerScore >= 70) return 'gold';
  if (topBuyerScore >= 55) return 'silver';
  if (topBuyerScore >= 40) return 'bronze';
  return 'standard';
}

/**
 * Generate top buyer reasons based on score components
 */
export function generateTopBuyerReasons(
  lead: ScoredBusinessLead,
  currentDomainAnalysis?: CurrentDomainAnalysis
): string[] {
  const reasons: string[] = [];
  
  // Domain weakness
  if (currentDomainAnalysis) {
    if (currentDomainAnalysis.overallScore < 50) {
      reasons.push('⚠ Weak current domain - major upgrade opportunity');
    } else if (currentDomainAnalysis.overallScore < 70) {
      reasons.push('⚠ Current domain could be improved');
    }
  } else if (!lead.website) {
    reasons.push('🎯 No website - perfect greenfield opportunity');
  }
  
  // Business establishment
  if (lead.reviewCount >= 200) {
    reasons.push('⭐ Highly established with 200+ reviews');
  } else if (lead.reviewCount >= 100) {
    reasons.push('⭐ Well-established with 100+ reviews');
  } else if (lead.reviewCount >= 50) {
    reasons.push('✓ Growing business with solid review base');
  }
  
  // Reputation
  if (lead.rating >= 4.5 && lead.reviewCount >= 50) {
    reasons.push('🏆 Excellent reputation - premium business');
  } else if (lead.rating >= 4.0) {
    reasons.push('✓ Strong reputation');
  }
  
  // Local presence
  if (lead.address && lead.phone && lead.reviewCount >= 20) {
    reasons.push('📍 Strong local presence with physical location');
  }
  
  // Contactability
  if (lead.email && lead.phone) {
    reasons.push('📞 Fully contactable - email and phone available');
  }
  
  // High buyer score
  if (lead.buyerScore >= 80) {
    reasons.push('💰 High buyer motivation score');
  } else if (lead.buyerScore >= 60) {
    reasons.push('💰 Good buyer potential');
  }
  
  return reasons.slice(0, 6); // Return top 6 reasons
}

/**
 * Analyze a business lead and generate complete prospect analysis
 */
export function analyzeProspect(
  lead: ScoredBusinessLead,
  currentDomainAnalysis?: CurrentDomainAnalysis
): ProspectAnalysis {
  const topBuyerScore = calculateTopBuyerScore(lead, currentDomainAnalysis);
  const contactReadiness = calculateContactReadinessScore(lead);
  const pitchAngles = generatePitchAngles(lead, currentDomainAnalysis);
  const ranking = assignRanking(topBuyerScore);
  const recommendedAction = determineRecommendedAction(topBuyerScore, contactReadiness.score);
  const topBuyerReasons = generateTopBuyerReasons(lead, currentDomainAnalysis);
  
  return {
    businessLeadId: lead.id,
    businessName: lead.name,
    topBuyerScore,
    buyerScore: lead.buyerScore,
    contactReadinessScore: contactReadiness.score,
    ranking,
    topBuyerReasons,
    contactReadinessReasons: contactReadiness.reasons,
    recommendedAction,
    pitchAngles,
    lead,
    currentDomainAnalysis,
  };
}

/**
 * Get top buyers from a list of leads
 */
export function getTopBuyers(
  analyses: ProspectAnalysis[],
  limit = 10
): ProspectAnalysis[] {
  return analyses
    .sort((a, b) => b.topBuyerScore - a.topBuyerScore)
    .slice(0, limit);
}

/**
 * Get most contactable prospects
 */
export function getMostContactable(
  analyses: ProspectAnalysis[],
  limit = 10
): ProspectAnalysis[] {
  return analyses
    .sort((a, b) => b.contactReadinessScore - a.contactReadinessScore)
    .slice(0, limit);
}

/**
 * Get immediate action prospects
 */
export function getImmediateActionProspects(
  analyses: ProspectAnalysis[]
): ProspectAnalysis[] {
  return analyses
    .filter(a => a.recommendedAction === 'immediate')
    .sort((a, b) => b.topBuyerScore - a.topBuyerScore);
}
