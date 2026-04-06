import { generateNaturalVariants, singularize, isNaturalDomainWord } from '../utils/inflection';

/**
 * Domain Generation Service
 * Generates domain name candidates based on niche, city, state, and modifiers
 * Implements scoring algorithms for quality, SEO, and resale value
 */

export interface DomainCandidate {
  domain: string;
  qualityScore: number;
  seoScore: number;
  resaleScore: number;
  naturalnessScore: number; // New: how natural/readable the domain is
  reasons: string[];
  pattern: string; // Track which pattern generated this domain
}

export type GenerationMode = 'standard' | 'expanded' | 'exhaustive';

export interface DomainGenerationParams {
  niche: string;
  city: string;
  state: string;
  modifiers?: string[];
  mode?: GenerationMode;
  initialBatchSize?: number; // For first display batch
}

/**
 * Niche variant mappings
 */
const NICHE_VARIANTS: Record<string, string[]> = {
  'car detailing': ['cardetail', 'autodetail', 'detailing', 'cardetailing', 'autodetailing'],
  'car': ['autodetail', 'cardetail', 'autocare', 'carcare', 'autoservice'],
  'roofing': ['roof', 'roofing', 'roofer', 'roofpro', 'roofrepair'],
  'hvac': ['hvac', 'heating', 'cooling', 'ac', 'climate'],
  'plumbing': ['plumber', 'plumbing', 'plumbingpro', 'pipe', 'drain'],
  'landscaping': ['landscape', 'landscaping', 'lawn', 'lawncare', 'yard'],
  'electrician': ['electric', 'electrical', 'electrician', 'electricpro', 'wiring'],
  'pest control': ['pest', 'pestcontrol', 'exterminator', 'bugcontrol', 'pestpro'],
  'cleaning': ['clean', 'cleaning', 'cleaners', 'cleanpro', 'houseclean'],
  'painting': ['paint', 'painting', 'painter', 'paintpro', 'paintservice'],
  'flooring': ['floor', 'flooring', 'floors', 'floorpro', 'floorinstall'],
  'windows': ['window', 'windows', 'windowpro', 'windowservice', 'glass'],
  'garage door': ['garagedoor', 'garage', 'garagepro', 'doorservice'],
  'concrete': ['concrete', 'cement', 'concretepro', 'concreteservice'],
  'fencing': ['fence', 'fencing', 'fencepro', 'fenceservice'],
};

/**
 * Common domain modifiers/suffixes
 */
const DOMAIN_SUFFIXES = [
  'pro',
  'pros',
  'service',
  'services',
  'co',
  'group',
  'experts',
  'solutions',
  'team',
  'local',
  'direct',
  'hub',
  'zone',
  'now',
  'plus',
];

// Additional modifiers for expanded/exhaustive modes
const EXPANDED_MODIFIERS = [
  'best',
  'top',
  'premier',
  'elite',
  'prime',
  'choice',
  'certified',
  'trusted',
  'quality',
];

/**
 * Generate domain candidates based on input parameters
 * Returns all generated candidates (no hard limit)
 */
export function generateDomainCandidates(params: DomainGenerationParams): DomainCandidate[] {
  const { niche, city, state, modifiers = [], mode = 'standard', initialBatchSize = 30 } = params;
  
  const candidates: DomainCandidate[] = [];
  const generated = new Set<string>();
  const rejected: string[] = [];
  
  // Normalize inputs
  const cityNorm = normalizeForDomain(city);
  const stateNorm = normalizeForDomain(state);
  const nicheVariants = getNicheVariants(niche);
  
  console.log(`[DomainGen] Generating domains for niche="${niche}" (${nicheVariants.length} variants), city="${city}", state="${state}"`);
  console.log(`[DomainGen] Generation mode: ${mode}`);
  console.log(`[DomainGen] Niche variants:`, nicheVariants);
  
  // Determine suffix limits based on mode
  const suffixLimit = mode === 'exhaustive' ? DOMAIN_SUFFIXES.length : 
                      mode === 'expanded' ? 8 : 4;
  const variantLimit = mode === 'exhaustive' ? nicheVariants.length : 
                       mode === 'expanded' ? Math.min(4, nicheVariants.length) : 
                       Math.min(2, nicheVariants.length);
  
  // Pattern 1: {city}{service}.com
  nicheVariants.forEach(nicheVariant => {
    const domain = `${cityNorm}${nicheVariant}.com`;
    if (!generated.has(domain) && isDomainQualityAcceptable(domain)) {
      generated.add(domain);
      candidates.push(createCandidate(domain, 'exact-city-service', { city, niche, state }));
    } else if (!isDomainQualityAcceptable(domain)) {
      rejected.push(domain);
    }
  });
  
  // Pattern 2: {state}{service}.com
  nicheVariants.forEach(nicheVariant => {
    const domain = `${stateNorm}${nicheVariant}.com`;
    if (!generated.has(domain) && isDomainQualityAcceptable(domain)) {
      generated.add(domain);
      candidates.push(createCandidate(domain, 'state-service', { city, niche, state }));
    } else if (!isDomainQualityAcceptable(domain)) {
      rejected.push(domain);
    }
  });
  
  // Pattern 3: {service}{city}.com
  nicheVariants.forEach(nicheVariant => {
    const domain = `${nicheVariant}${cityNorm}.com`;
    if (!generated.has(domain) && isDomainQualityAcceptable(domain)) {
      generated.add(domain);
      candidates.push(createCandidate(domain, 'service-city', { city, niche, state }));
    } else if (!isDomainQualityAcceptable(domain)) {
      rejected.push(domain);
    }
  });
  
  // Pattern 4: {service}{state}.com
  nicheVariants.forEach(nicheVariant => {
    const domain = `${nicheVariant}${stateNorm}.com`;
    if (!generated.has(domain) && isDomainQualityAcceptable(domain)) {
      generated.add(domain);
      candidates.push(createCandidate(domain, 'service-state', { city, niche, state }));
    } else if (!isDomainQualityAcceptable(domain)) {
      rejected.push(domain);
    }
  });
  
  // Pattern 5: {city}{service}{suffix}.com
  nicheVariants.slice(0, variantLimit).forEach(nicheVariant => {
    DOMAIN_SUFFIXES.slice(0, suffixLimit).forEach(suffix => {
      const domain = `${cityNorm}${nicheVariant}${suffix}.com`;
      if (!generated.has(domain) && isDomainQualityAcceptable(domain)) {
        generated.add(domain);
        candidates.push(createCandidate(domain, 'city-service-suffix', { city, niche, state }));
      } else if (!isDomainQualityAcceptable(domain)) {
        rejected.push(domain);
      }
    });
  });
  
  // Pattern 6: {service}{city}{suffix}.com
  nicheVariants.slice(0, variantLimit).forEach(nicheVariant => {
    DOMAIN_SUFFIXES.slice(0, suffixLimit).forEach(suffix => {
      const domain = `${nicheVariant}${cityNorm}${suffix}.com`;
      if (!generated.has(domain) && isDomainQualityAcceptable(domain)) {
        generated.add(domain);
        candidates.push(createCandidate(domain, 'service-city-suffix', { city, niche, state }));
      } else if (!isDomainQualityAcceptable(domain)) {
        rejected.push(domain);
      }
    });
  });
  
  // Pattern 7: {state}{service}{suffix}.com
  nicheVariants.slice(0, variantLimit).forEach(nicheVariant => {
    DOMAIN_SUFFIXES.slice(0, suffixLimit).forEach(suffix => {
      const domain = `${stateNorm}${nicheVariant}${suffix}.com`;
      if (!generated.has(domain) && isDomainQualityAcceptable(domain)) {
        generated.add(domain);
        candidates.push(createCandidate(domain, 'state-service-suffix', { city, niche, state }));
      } else if (!isDomainQualityAcceptable(domain)) {
        rejected.push(domain);
      }
    });
  });
  
  // Pattern 8: {service}{state}{suffix}.com
  nicheVariants.slice(0, variantLimit).forEach(nicheVariant => {
    DOMAIN_SUFFIXES.slice(0, suffixLimit).forEach(suffix => {
      const domain = `${nicheVariant}${stateNorm}${suffix}.com`;
      if (!generated.has(domain) && isDomainQualityAcceptable(domain)) {
        generated.add(domain);
        candidates.push(createCandidate(domain, 'service-state-suffix', { city, niche, state }));
      } else if (!isDomainQualityAcceptable(domain)) {
        rejected.push(domain);
      }
    });
  });
  
  // Pattern 9: {modifier}{city}{service}.com (expanded/exhaustive modes)
  if (mode !== 'standard') {
    const modifiersToUse = mode === 'exhaustive' ? EXPANDED_MODIFIERS : EXPANDED_MODIFIERS.slice(0, 3);
    modifiersToUse.forEach(modifier => {
      nicheVariants.slice(0, 2).forEach(nicheVariant => {
        const domain = `${modifier}${cityNorm}${nicheVariant}.com`;
        if (!generated.has(domain) && isDomainQualityAcceptable(domain)) {
          generated.add(domain);
          candidates.push(createCandidate(domain, 'modifier-city-service', { city, niche, state }));
        } else if (!isDomainQualityAcceptable(domain)) {
          rejected.push(domain);
        }
      });
    });
  }
  
  // Pattern 7: With custom modifiers
  if (modifiers.length > 0) {
    modifiers.forEach(modifier => {
      const modNorm = normalizeForDomain(modifier);
      nicheVariants.slice(0, 2).forEach(nicheVariant => {
        const domain = `${cityNorm}${modNorm}${nicheVariant}.com`;
        if (!generated.has(domain)) {
          generated.add(domain);
          candidates.push(createCandidate(domain, 'city-modifier-service', { city, niche, state }));
        }
      });
    });
  }
  
  // Log quality metrics
  console.log(`[DomainGen] ✅ Generated: ${candidates.length} candidates, Rejected: ${rejected.length} low-quality`);
  if (rejected.length > 0 && rejected.length <= 10) {
    console.log(`[DomainGen] Sample rejected:`, rejected.slice(0, 10));
  }
  
  // Sort by quality score (return ALL candidates sorted, no slicing)
  const sortedCandidates = candidates.sort((a, b) => b.qualityScore - a.qualityScore);
  
  const avgQuality = sortedCandidates.length > 0 
    ? (sortedCandidates.reduce((sum, c) => sum + c.qualityScore, 0) / sortedCandidates.length).toFixed(1)
    : '0';
    
  console.log(`[DomainGen] 📊 Returning ALL ${sortedCandidates.length} candidates (avg quality: ${avgQuality})`);
  console.log(`[DomainGen] 🎯 Top candidate: ${sortedCandidates[0]?.domain} (quality: ${sortedCandidates[0]?.qualityScore.toFixed(1)})`);
  
  return sortedCandidates;
}

/**
 * Check if a domain passes basic quality checks
 * Rejects obviously bad/awkward domain names
 */
function isDomainQualityAcceptable(domain: string): boolean {
  const domainName = domain.replace('.com', '').toLowerCase();
  
  // Reject patterns that are almost always ugly
  const rejectPatterns = [
    /s{3,}/,           // triple 's' or more (carwashsservice)
    /(.)\1{3,}/,       // any character repeated 4+ times
    /[^a-z0-9]/,       // non-alphanumeric characters
    /^.{1,2}$/,        // too short (< 3 chars)
    /^.{40,}$/,        // too long (40+ chars)
    /ings$/,           // -ings ending (cleanings, detailings - sounds forced)
    /s{2}[a-z]+$/,     // double s in middle-end (carwashs, glasss)
  ];
  
  for (const pattern of rejectPatterns) {
    if (pattern.test(domainName)) {
      return false;
    }
  }
  
  // Reject domains with awkward word combinations
  // Check for unnatural service forms
  const words = extractWords(domainName);
  for (const word of words) {
    if (!isNaturalDomainWord(word, 'service')) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get niche variants for domain generation
 */
function getNicheVariants(niche: string): string[] {
  const lowerNiche = niche.toLowerCase();
  
  // Check if we have predefined variants
  if (NICHE_VARIANTS[lowerNiche]) {
    return NICHE_VARIANTS[lowerNiche];
  }
  
  // Generate natural variants using inflection helper
  const normalized = normalizeForDomain(niche);
  const naturalVariants = generateNaturalVariants(normalized);
  
  // Only add "service" variant for singular forms that sound natural
  const withService: string[] = [];
  const singular = singularize(normalized);
  if (isNaturalDomainWord(singular + 'service', 'service')) {
    withService.push(singular + 'service');
  }
  
  // Combine and deduplicate
  return Array.from(new Set([...naturalVariants, ...withService])).slice(0, 4);
}

/**
 * Normalize text for use in domain names
 */
function normalizeForDomain(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Create a domain candidate with scoring
 */
function createCandidate(
  domain: string,
  pattern: string,
  context: { city: string; niche: string; state: string }
): DomainCandidate {
  const naturalnessScore = calculateNaturalnessScore(domain, pattern);
  const qualityScore = calculateQualityScore(domain, pattern, naturalnessScore);
  const seoScore = calculateSEOScore(domain, pattern, context);
  const resaleScore = calculateResaleScore(domain, pattern);
  const reasons = generateReasons(domain, pattern, qualityScore, seoScore, naturalnessScore);
  
  return {
    domain,
    qualityScore,
    seoScore,
    resaleScore,
    naturalnessScore,
    reasons,
    pattern,
  };
}

/**
 * Calculate quality score (0-100)
 * Based on: length, readability, TLD, memorability
 */
/**
 * Calculate naturalness score - how natural and readable the domain feels
 * Penalizes awkward combinations, repetition, and hard-to-pronounce patterns
 */
function calculateNaturalnessScore(domain: string, pattern: string): number {
  let score = 100; // Start at perfect
  
  const domainName = domain.replace('.com', '').toLowerCase();
  const length = domainName.length;
  
  // Penalty for excessive length (harder to remember and type)
  if (length > 25) {
    score -= 30;
  } else if (length > 20) {
    score -= 20;
  } else if (length > 18) {
    score -= 10;
  }
  
  // Penalty for repetitive characters (e.g., "aaa", "lll")
  if (/([a-z])\1{2,}/.test(domainName)) {
    score -= 25;
  }
  
  // Penalty for awkward consonant clusters (hard to pronounce)
  const awkwardClusters = ['tch', 'ngst', 'ngt', 'ghtl', 'chtm', 'ndtm'];
  for (const cluster of awkwardClusters) {
    if (domainName.includes(cluster)) {
      score -= 15;
      break;
    }
  }
  
  // Penalty for repeated words (e.g., "tampatampa", "roofingroofing")
  const words = extractWords(domainName);
  const uniqueWords = new Set(words);
  if (words.length !== uniqueWords.size) {
    score -= 30; // Heavy penalty for word repetition
  }
  
  // Penalty for too many words crammed together
  if (words.length > 4) {
    score -= 20;
  }
  
  // Penalty for confusing letter combinations
  const confusingPairs = ['ll', 'ii', 'oo', 'ee'];
  let confusingCount = 0;
  for (const pair of confusingPairs) {
    if (domainName.includes(pair)) {
      confusingCount++;
    }
  }
  if (confusingCount > 2) {
    score -= 15;
  }
  
  // Penalty for ending with common awkward patterns
  const awkwardEndings = ['ingservice', 'ingcompany', 'ingbusiness', 'ingpros'];
  for (const ending of awkwardEndings) {
    if (domainName.endsWith(ending)) {
      score -= 10;
      break;
    }
  }
  
  // Bonus for clean 2-word patterns (most natural)
  if (words.length === 2 && length <= 16) {
    score += 10;
  }
  
  // Bonus for strong 3-word patterns
  if (words.length === 3 && length <= 18) {
    score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Extract individual words from a domain name
 * Simple heuristic based on common service/geo terms
 */
function extractWords(domainName: string): string[] {
  const commonWords = [
    'tampa', 'florida', 'miami', 'orlando', 'phoenix', 'arizona', 'california',
    'roofing', 'roofer', 'roof', 'hvac', 'plumbing', 'plumber', 'detailing',
    'service', 'services', 'company', 'pro', 'pros', 'expert', 'experts',
    'repair', 'specialist', 'contractor', 'contractors', 'mobile', 'local'
  ];
  
  const words: string[] = [];
  let remaining = domainName;
  
  // Try to match known words
  while (remaining.length > 0) {
    let matched = false;
    
    for (const word of commonWords) {
      if (remaining.startsWith(word)) {
        words.push(word);
        remaining = remaining.slice(word.length);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      // If no match, treat remaining as one word
      words.push(remaining);
      break;
    }
  }
  
  return words;
}

function calculateQualityScore(domain: string, pattern: string, naturalnessScore: number): number {
  let score = 50; // Base score
  
  const domainName = domain.replace('.com', '');
  const length = domainName.length;
  
  // Length scoring (shorter is better, but not too short)
  if (length <= 12) {
    score += 20;
  } else if (length <= 18) {
    score += 10;
  } else if (length <= 25) {
    score += 0;
  } else {
    score -= 10;
  }
  
  // Pattern scoring
  if (pattern === 'exact-city-service') {
    score += 15;
  } else if (pattern === 'service-city') {
    score += 10;
  } else if (pattern === 'state-service') {
    score += 8;
  } else if (pattern.includes('suffix')) {
    score += 5;
  }
  
  // TLD scoring (.com is premium)
  if (domain.endsWith('.com')) {
    score += 15;
  }
  
  // Factor in naturalness score (weighted)
  const naturalnessBonus = (naturalnessScore - 50) * 0.2; // 20% weight
  score += naturalnessBonus;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate SEO score (0-100)
 * Based on: keyword relevance, geo-targeting, search volume estimation
 */
function calculateSEOScore(
  domain: string,
  pattern: string,
  context: { city: string; niche: string; state: string }
): number {
  let score = 50; // Base score
  
  const domainName = domain.replace('.com', '').toLowerCase();
  const cityNorm = normalizeForDomain(context.city);
  const stateNorm = normalizeForDomain(context.state);
  
  // Geo-targeting scoring
  if (domainName.includes(cityNorm)) {
    score += 20; // City name is very valuable for local SEO
  }
  if (domainName.includes(stateNorm)) {
    score += 10; // State name is good for broader reach
  }
  
  // Keyword relevance
  const nicheVariants = getNicheVariants(context.niche);
  const hasNicheKeyword = nicheVariants.some(variant => 
    domainName.includes(variant.toLowerCase())
  );
  if (hasNicheKeyword) {
    score += 15;
  }
  
  // Pattern-based SEO value
  if (pattern === 'exact-city-service') {
    score += 10; // Perfect for local search
  } else if (pattern === 'service-city') {
    score += 8;
  }
  
  // Exact match domain bonus
  const searchQuery = `${cityNorm}${getNicheVariants(context.niche)[0]}`;
  if (domainName === searchQuery) {
    score += 15;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate resale score (0-100)
 * Based on: market demand, brandability, universality
 */
function calculateResaleScore(domain: string, pattern: string): number {
  let score = 40; // Base score
  
  const domainName = domain.replace('.com', '');
  const length = domainName.length;
  
  // Length is crucial for resale
  if (length <= 10) {
    score += 25; // Very short domains are premium
  } else if (length <= 15) {
    score += 15;
  } else if (length <= 20) {
    score += 5;
  }
  
  // Brandability (domains without hyphens, numbers)
  if (!/[-0-9]/.test(domainName)) {
    score += 15;
  }
  
  // Pattern value for resale
  if (pattern === 'exact-city-service' || pattern === 'state-service') {
    score += 10; // Geo-service domains have good resale value
  }
  
  // .com TLD premium
  if (domain.endsWith('.com')) {
    score += 10;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Generate human-readable reasons for the domain score
 */
function generateReasons(
  domain: string,
  pattern: string,
  qualityScore: number,
  seoScore: number,
  naturalnessScore: number
): string[] {
  const reasons: string[] = [];
  const domainName = domain.replace('.com', '');
  const length = domainName.length;
  
  // Pattern-based reasons
  if (pattern === 'exact-city-service') {
    reasons.push('Exact city + service match');
  } else if (pattern === 'service-city') {
    reasons.push('Service-first keyword order');
  } else if (pattern === 'state-service') {
    reasons.push('State-level geo match');
  } else if (pattern === 'city-service-suffix') {
    reasons.push('City + service with trust-building suffix');
  }
  
  // Naturalness-based reasons
  if (naturalnessScore >= 90) {
    reasons.push('Highly natural and memorable');
  } else if (naturalnessScore >= 75) {
    reasons.push('Clean and readable');
  } else if (naturalnessScore < 50) {
    reasons.push('Complex structure'); // Warning
  }
  
  // Quality-based reasons
  if (length <= 12) {
    reasons.push('Short and memorable');
  } else if (length <= 18) {
    reasons.push('Good length for branding');
  }
  
  if (qualityScore >= 85) {
    reasons.push('High overall quality');
  }
  
  // SEO-based reasons
  if (seoScore >= 85) {
    reasons.push('Strong local SEO potential');
  } else if (seoScore >= 70) {
    reasons.push('Good local SEO match');
  }
  
  // TLD reason
  if (domain.endsWith('.com')) {
    reasons.push('.com TLD premium');
  }
  
  // Ensure at least one reason
  if (reasons.length === 0) {
    reasons.push('Viable geo-service domain');
  }
  
  return reasons.slice(0, 4); // Limit to 4 reasons
}
