/**
 * Business Matching Service
 * Calculates buyer scores for businesses and matches them with domain opportunities
 */

import { DomainCandidate } from './domain-generator';

export interface BusinessLead {
  id: string;
  name: string;
  niche: string;
  city: string;
  state: string;
  phone?: string;
  email?: string;
  website?: string;
  address: string;
  rating: number;
  reviewCount: number;
  currentDomain?: string;
  status?: string;
  tags?: string[];
}

export interface ScoredBusinessLead extends BusinessLead {
  buyerScore: number;
  scoreReasons: string[];
}

export interface DomainBusinessMatch {
  businessLeadId: string;
  domainOpportunityId?: string;
  domain: string;
  businessName: string;
  fitScore: number;
  matchReason: string;
  reasons: string[];
  alternativeDomains?: string[]; // Top 3 alternative domain recommendations
  currentDomainAnalysis?: CurrentDomainAnalysis;
}

export interface CurrentDomainAnalysis {
  domain: string;
  weaknesses: string[];
  strengths: string[];
  overallScore: number; // 0-100, lower is weaker (more opportunity)
}

/**
 * Calculate buyer score for a business lead (0-100)
 * Higher score = more likely to buy a premium domain
 */
export function calculateBuyerScore(lead: BusinessLead): ScoredBusinessLead {
  // Preserve all original fields including id
  let score = 0;
  const reasons: string[] = [];
  
  // 1. Website Quality Assessment (40 points max)
  const websiteScore = assessWebsiteQuality(lead.website, lead.currentDomain);
  score += websiteScore.score;
  reasons.push(...websiteScore.reasons);
  
  // 2. Business Reputation (30 points max)
  const reputationScore = assessReputation(lead.rating, lead.reviewCount);
  score += reputationScore.score;
  reasons.push(...reputationScore.reasons);
  
  // 3. Digital Presence (20 points max)
  const digitalScore = assessDigitalPresence(lead);
  score += digitalScore.score;
  reasons.push(...digitalScore.reasons);
  
  // 4. Business Maturity (10 points max)
  const maturityScore = assessBusinessMaturity(lead);
  score += maturityScore.score;
  reasons.push(...maturityScore.reasons);
  
  return {
    ...lead,
    buyerScore: Math.min(100, Math.max(0, score)),
    scoreReasons: reasons,
  };
}

/**
 * Assess website quality (0-40 points)
 */
function assessWebsiteQuality(
  website: string | undefined,
  currentDomain: string | undefined
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  if (!website) {
    score += 40;
    reasons.push('No website - perfect opportunity for domain upgrade');
    return { score, reasons };
  }
  
  const websiteLower = website.toLowerCase();
  
  // Check for weak domain platforms
  const weakPlatforms = [
    { pattern: 'wixsite.com', score: 35, reason: 'Weak Wix subdomain' },
    { pattern: 'weebly.com', score: 35, reason: 'Weak Weebly subdomain' },
    { pattern: 'squarespace.com', score: 32, reason: 'Squarespace subdomain' },
    { pattern: 'godaddysites.com', score: 32, reason: 'GoDaddy builder subdomain' },
    { pattern: 'wordpress.com', score: 30, reason: 'WordPress.com subdomain' },
    { pattern: 'blogspot.com', score: 30, reason: 'Blogspot subdomain' },
  ];
  
  for (const platform of weakPlatforms) {
    if (websiteLower.includes(platform.pattern)) {
      score += platform.score;
      reasons.push(`${platform.reason} - major upgrade potential`);
      return { score, reasons };
    }
  }
  
  // Check for custom domain quality
  if (currentDomain) {
    const domainLower = currentDomain.toLowerCase();
    
    // Long domain names
    if (domainLower.length > 25) {
      score += 20;
      reasons.push('Long domain name - could benefit from shorter option');
    }
    
    // Hyphens in domain
    if (domainLower.includes('-')) {
      score += 15;
      reasons.push('Domain contains hyphens - not ideal for branding');
    }
    
    // Numbers in domain
    if (/\d/.test(domainLower)) {
      score += 12;
      reasons.push('Domain contains numbers - less professional');
    }
    
    // Not .com TLD
    if (!domainLower.endsWith('.com')) {
      score += 18;
      reasons.push('Non-.com domain - .com upgrade valuable');
    }
    
    // Acronym domains
    if (/^[a-z]{2,4}[^a-z]/.test(domainLower)) {
      score += 15;
      reasons.push('Acronym domain - descriptive domain would be clearer');
    }
  }
  
  // Has custom domain but could be better
  if (score === 0 && currentDomain) {
    score += 5;
    reasons.push('Has domain but geo-service match could improve SEO');
  }
  
  return { score, reasons };
}

/**
 * Assess business reputation (0-30 points)
 */
function assessReputation(
  rating: number,
  reviewCount: number
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  // Rating score (0-15 points)
  if (rating >= 4.5) {
    score += 15;
    reasons.push('Excellent rating - established quality business');
  } else if (rating >= 4.0) {
    score += 12;
    reasons.push('Strong rating - good reputation');
  } else if (rating >= 3.5) {
    score += 8;
    reasons.push('Good rating - has customer base');
  } else if (rating > 0) {
    score += 5;
    reasons.push('Has customer reviews');
  }
  
  // Review count score (0-15 points)
  if (reviewCount >= 200) {
    score += 15;
    reasons.push('High review count - established business');
  } else if (reviewCount >= 100) {
    score += 12;
    reasons.push('Good review volume - active customer base');
  } else if (reviewCount >= 50) {
    score += 10;
    reasons.push('Moderate reviews - growing business');
  } else if (reviewCount >= 20) {
    score += 7;
    reasons.push('Has customer feedback');
  } else if (reviewCount > 0) {
    score += 3;
  }
  
  return { score, reasons };
}

/**
 * Assess digital presence (0-20 points)
 */
function assessDigitalPresence(lead: BusinessLead): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  // Has contact information
  if (lead.email) {
    score += 8;
    reasons.push('Has email contact - digitally reachable');
  }
  
  if (lead.phone) {
    score += 5;
  }
  
  // No digital presence = high opportunity
  if (!lead.website && !lead.email) {
    score += 7;
    reasons.push('Limited digital presence - high growth potential');
  }
  
  return { score, reasons };
}

/**
 * Assess business maturity (0-10 points)
 */
function assessBusinessMaturity(lead: BusinessLead): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  // Growing business indicators
  if (lead.reviewCount > 50 && !lead.website) {
    score += 10;
    reasons.push('Active business without web presence - prime target');
  } else if (lead.reviewCount > 20 && lead.reviewCount < 100) {
    score += 5;
    reasons.push('Growing business - good timing for upgrade');
  }
  
  return { score, reasons };
}

/**
 * Match domains to businesses and calculate fit scores
 */
export function matchDomainsToBusinesses(
  domains: DomainCandidate[],
  businesses: ScoredBusinessLead[]
): DomainBusinessMatch[] {
  const matches: DomainBusinessMatch[] = [];
  
  for (const business of businesses) {
    // Find best matching domains for this business
    const domainMatches = domains.map(domain => ({
      domain,
      fitScore: calculateFitScore(domain, business),
    }));
    
    // Sort by fit score
    domainMatches.sort((a, b) => b.fitScore - a.fitScore);
    
    // Take the best match
    const bestMatch = domainMatches[0];
    if (bestMatch && bestMatch.fitScore > 50) {
      const matchReason = generateMatchReason(bestMatch.domain, business);
      const reasons = generateMatchReasons(bestMatch.domain, business);
      
      // Get top 3 alternative domains
      const alternativeDomains = domainMatches
        .slice(1, 4) // Skip the best match, get next 3
        .filter(m => m.fitScore > 40) // Only include decent alternatives
        .map(m => m.domain.domain);
      
      // Analyze current domain if business has one
      const currentDomainAnalysis = business.currentDomain
        ? analyzeCurrentDomain(business.currentDomain, business)
        : undefined;
      
      matches.push({
        businessLeadId: business.id,
        domain: bestMatch.domain.domain,
        businessName: business.name,
        fitScore: bestMatch.fitScore,
        matchReason,
        reasons,
        alternativeDomains: alternativeDomains.length > 0 ? alternativeDomains : undefined,
        currentDomainAnalysis,
      });
    }
  }
  
  return matches;
}

/**
 * Calculate how well a domain fits a specific business (0-100)
 * Phase 7: Enhanced with additional factors for better matching
 */
function calculateFitScore(domain: DomainCandidate, business: ScoredBusinessLead): number {
  let score = 0;
  const domainLower = domain.domain.toLowerCase();
  const domainName = domain.domain.replace('.com', '');
  const cityNorm = business.city.toLowerCase().replace(/\s+/g, '');
  const stateNorm = business.state.toLowerCase().replace(/\s+/g, '');
  const nicheNorm = business.niche.toLowerCase().replace(/\s+/g, '');
  
  // 1. Base score from domain quality (35% weight) - slightly reduced to make room for new factors
  score += domain.qualityScore * 0.20;
  score += domain.seoScore * 0.25; // SEO most important for local businesses
  score += domain.naturalnessScore * 0.15; // Readability matters
  score += domain.resaleScore * 0.08;
  
  // 2. Geographic and niche relevance (25% weight) - Phase 7: More nuanced
  let geoServiceBonus = 0;
  
  // City match is critical for local SEO
  if (domainLower.includes(cityNorm)) {
    geoServiceBonus += 15;
    // Bonus if city is at the beginning (better for recall)
    if (domainLower.startsWith(cityNorm)) {
      geoServiceBonus += 3;
    }
  }
  
  // State match (valuable if no city)
  if (domainLower.includes(stateNorm)) {
    if (!domainLower.includes(cityNorm)) {
      geoServiceBonus += 8;
    } else {
      geoServiceBonus += 2; // Small bonus for having both
    }
  }
  
  // Service/niche match
  if (domainLower.includes(nicheNorm)) {
    geoServiceBonus += 12;
    // Bonus if service is at the end (natural pattern: "CityService")
    if (domainLower.endsWith(nicheNorm + '.com')) {
      geoServiceBonus += 2;
    }
  }
  
  score += geoServiceBonus;
  
  // 3. Buyer motivation (15% weight) - Phase 7: Consider buyer readiness
  score += business.buyerScore * 0.15;
  
  // 4. Current domain weakness (15% weight) - Phase 7: Enhanced
  if (business.currentDomain) {
    const currentAnalysis = analyzeCurrentDomain(business.currentDomain, business);
    // Weaker current domain = higher opportunity
    const weaknessBonus = (100 - currentAnalysis.overallScore) * 0.15;
    score += weaknessBonus;
    
    // Extra bonus if current domain is missing both geo AND service
    if (currentAnalysis.weaknesses.includes('No geographic keywords (city or state)') &&
        currentAnalysis.weaknesses.includes('Missing service/niche keyword')) {
      score += 5; // High opportunity
    }
  } else {
    // No current domain = very high opportunity
    score += 15;
  }
  
  // 5. Business local authority (5% weight) - Phase 7: New factor
  let authorityBonus = 0;
  if (business.rating >= 4.5 && business.reviewCount >= 100) {
    authorityBonus += 5; // Established authority
  } else if (business.rating >= 4.0 && business.reviewCount >= 50) {
    authorityBonus += 3; // Good authority
  }
  score += authorityBonus;
  
  // 6. Domain readability (5% weight) - Phase 7: Enhanced
  let readabilityBonus = 0;
  
  // Shorter domains are easier to remember and type
  if (domainName.length <= 12) {
    readabilityBonus += 5;
  } else if (domainName.length <= 15) {
    readabilityBonus += 3;
  } else if (domainName.length <= 20) {
    readabilityBonus += 1;
  } else if (domainName.length > 25) {
    readabilityBonus -= 3; // Penalty for very long domains
  }
  
  // Bonus for clean, no-hyphen, no-number domains
  if (!/[-0-9]/.test(domainName)) {
    readabilityBonus += 2;
  }
  
  score += readabilityBonus;
  
  // 7. Outreach readiness bonus (Optional - if contact info available)
  // Phase 7: Consider how easy it is to reach the business
  if (business.email && business.phone) {
    score += 3; // Easy to contact = higher conversion probability
  } else if (business.email || business.phone) {
    score += 1;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Analyze the current domain to identify weaknesses and opportunities
 */
function analyzeCurrentDomain(domain: string, business: ScoredBusinessLead): CurrentDomainAnalysis {
  const weaknesses: string[] = [];
  const strengths: string[] = [];
  let score = 50; // Start neutral
  
  const domainName = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
  const domainWithoutTld = domainName.replace(/\.[a-z]{2,}$/, '');
  const length = domainWithoutTld.length;
  
  const cityNorm = business.city.toLowerCase().replace(/\s+/g, '');
  const stateNorm = business.state.toLowerCase().replace(/\s+/g, '');
  const nicheNorm = business.niche.toLowerCase().replace(/\s+/g, '');
  
  // Check geo-optimization
  const hasCity = domainWithoutTld.includes(cityNorm);
  const hasState = domainWithoutTld.includes(stateNorm);
  
  if (!hasCity && !hasState) {
    weaknesses.push('No geographic keywords (city or state)');
    score -= 20;
  } else {
    if (hasCity) {
      strengths.push('Contains city name');
      score += 15;
    }
    if (hasState) {
      strengths.push('Contains state name');
      score += 10;
    }
  }
  
  // Check service keyword
  const hasService = domainWithoutTld.includes(nicheNorm);
  if (!hasService) {
    weaknesses.push('Missing service/niche keyword');
    score -= 15;
  } else {
    strengths.push('Contains service keyword');
    score += 15;
  }
  
  // Check length
  if (length > 25) {
    weaknesses.push('Too long - hard to remember');
    score -= 15;
  } else if (length > 20) {
    weaknesses.push('Somewhat long');
    score -= 5;
  } else if (length <= 15) {
    strengths.push('Good length');
    score += 10;
  }
  
  // Check if it's branded vs generic
  if (!hasCity && !hasState && !hasService) {
    strengths.push('Branded domain (not geo-specific)');
    score += 5; // Branded can be good too
  }
  
  // Check TLD
  if (!domainName.endsWith('.com')) {
    weaknesses.push('Not a .com domain');
    score -= 10;
  } else {
    strengths.push('.com TLD');
    score += 5;
  }
  
  // Check for hyphens or numbers
  if (/[-0-9]/.test(domainWithoutTld)) {
    weaknesses.push('Contains hyphens or numbers');
    score -= 10;
  }
  
  // If no weaknesses found, add a neutral note
  if (weaknesses.length === 0) {
    strengths.push('Strong existing domain');
    score += 10;
  }
  
  return {
    domain: domainName,
    weaknesses,
    strengths,
    overallScore: Math.min(100, Math.max(0, score)),
  };
}

/**
 * Generate main match reason text
 */
function generateMatchReason(domain: DomainCandidate, business: ScoredBusinessLead): string {
  const domainName = domain.domain;
  const currentDomain = business.currentDomain;
  
  // No website case
  if (!business.website) {
    return `No website at all - a geo-service .com domain like ${domainName} would establish online presence instantly`;
  }
  
  // Weak domain platforms
  const websiteLower = business.website?.toLowerCase() || '';
  if (websiteLower.includes('wixsite.com')) {
    return `Free Wix subdomain severely limits credibility - ${domainName} would be a major upgrade`;
  }
  if (websiteLower.includes('weebly.com')) {
    return `Weebly subdomain severely limits search visibility - a proper .com is essential for growth`;
  }
  if (websiteLower.includes('squarespace.com')) {
    return `Squarespace subdomain limits SEO potential - ${domainName} would boost local rankings`;
  }
  if (websiteLower.includes('godaddysites.com')) {
    return `GoDaddy builder subdomain lacks professionalism - a custom domain elevates brand`;
  }
  
  // Has custom domain
  if (currentDomain) {
    if (currentDomain.length > 25) {
      return `Current domain is very long - ${domainName} offers better memorability`;
    }
    if (currentDomain.includes('-')) {
      return `Hyphens in current domain hurt branding - ${domainName} is cleaner and more professional`;
    }
    if (!currentDomain.endsWith('.com')) {
      return `Non-.com domain limits trust - ${domainName} provides the .com premium`;
    }
    return `Geo-service domain ${domainName} would capture more local search traffic vs current domain`;
  }
  
  return `${domainName} offers excellent geo-service match for local SEO and branding`;
}

/**
 * Generate detailed match reasons
 */
function generateMatchReasons(domain: DomainCandidate, business: ScoredBusinessLead): string[] {
  const reasons: string[] = [];
  
  // Add domain quality reasons
  reasons.push(...domain.reasons);
  
  // Add business-specific reasons
  if (business.buyerScore >= 80) {
    reasons.push('High buyer motivation - weak current domain');
  } else if (business.buyerScore >= 60) {
    reasons.push('Good upgrade potential');
  }
  
  if (business.rating >= 4.5) {
    reasons.push('Excellent reputation - ready for premium domain');
  }
  
  if (business.reviewCount >= 100) {
    reasons.push('Established business with customer base');
  }
  
  return reasons.slice(0, 5); // Limit to top 5 reasons
}

/**
 * Calculate buyer scores for multiple businesses
 */
export function scoreBusinessLeads(leads: BusinessLead[]): ScoredBusinessLead[] {
  return leads.map(lead => calculateBuyerScore(lead));
}

/**
 * Filter and sort businesses by buyer score
 */
export function rankBusinessesByBuyerScore(
  leads: ScoredBusinessLead[],
  minScore = 50
): ScoredBusinessLead[] {
  return leads
    .filter(lead => lead.buyerScore >= minScore)
    .sort((a, b) => b.buyerScore - a.buyerScore);
}
