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
  reasons: string[];
}

export interface DomainGenerationParams {
  niche: string;
  city: string;
  state: string;
  modifiers?: string[];
  maxResults?: number;
}

/**
 * Niche variant mappings
 */
const NICHE_VARIANTS: Record<string, string[]> = {
  'car detailing': ['cardetailing', 'autodetailing', 'detailing', 'carwash', 'autowash'],
  'roofing': ['roofing', 'roofer', 'roofrepair', 'roofingcompany', 'roofingservice'],
  'hvac': ['hvac', 'heating', 'cooling', 'heatingandcooling', 'airconditioning', 'ac'],
  'plumbing': ['plumbing', 'plumber', 'plumbingservice', 'plumbingcompany'],
  'landscaping': ['landscaping', 'landscape', 'lawncare', 'gardening', 'yardwork'],
  'electrician': ['electrician', 'electrical', 'electric', 'electricalservice'],
  'pest control': ['pestcontrol', 'exterminator', 'bugcontrol', 'pestremoval'],
  'cleaning': ['cleaning', 'cleaningservice', 'housecleaning', 'cleaners'],
};

/**
 * Common domain modifiers/suffixes
 */
const DOMAIN_SUFFIXES = [
  'pros',
  'experts',
  'specialists',
  'services',
  'company',
  'solutions',
  'group',
];

/**
 * Generate domain candidates based on input parameters
 */
export function generateDomainCandidates(params: DomainGenerationParams): DomainCandidate[] {
  const { niche, city, state, modifiers = [], maxResults = 20 } = params;
  
  const candidates: DomainCandidate[] = [];
  const generated = new Set<string>();
  
  // Normalize inputs
  const cityNorm = normalizeForDomain(city);
  const stateNorm = normalizeForDomain(state);
  const nicheVariants = getNicheVariants(niche);
  
  // Pattern 1: {city}{service}.com
  nicheVariants.forEach(nicheVariant => {
    const domain = `${cityNorm}${nicheVariant}.com`;
    if (!generated.has(domain)) {
      generated.add(domain);
      candidates.push(createCandidate(domain, 'exact-city-service', { city, niche, state }));
    }
  });
  
  // Pattern 2: {state}{service}.com
  nicheVariants.forEach(nicheVariant => {
    const domain = `${stateNorm}${nicheVariant}.com`;
    if (!generated.has(domain)) {
      generated.add(domain);
      candidates.push(createCandidate(domain, 'state-service', { city, niche, state }));
    }
  });
  
  // Pattern 3: {service}{city}.com
  nicheVariants.forEach(nicheVariant => {
    const domain = `${nicheVariant}${cityNorm}.com`;
    if (!generated.has(domain)) {
      generated.add(domain);
      candidates.push(createCandidate(domain, 'service-city', { city, niche, state }));
    }
  });
  
  // Pattern 4: {service}{state}.com
  nicheVariants.forEach(nicheVariant => {
    const domain = `${nicheVariant}${stateNorm}.com`;
    if (!generated.has(domain)) {
      generated.add(domain);
      candidates.push(createCandidate(domain, 'service-state', { city, niche, state }));
    }
  });
  
  // Pattern 5: {city}{service}{suffix}.com
  nicheVariants.slice(0, 2).forEach(nicheVariant => {
    DOMAIN_SUFFIXES.forEach(suffix => {
      const domain = `${cityNorm}${nicheVariant}${suffix}.com`;
      if (!generated.has(domain)) {
        generated.add(domain);
        candidates.push(createCandidate(domain, 'city-service-suffix', { city, niche, state }));
      }
    });
  });
  
  // Pattern 6: {service}{city}{suffix}.com
  nicheVariants.slice(0, 2).forEach(nicheVariant => {
    DOMAIN_SUFFIXES.slice(0, 3).forEach(suffix => {
      const domain = `${nicheVariant}${cityNorm}${suffix}.com`;
      if (!generated.has(domain)) {
        generated.add(domain);
        candidates.push(createCandidate(domain, 'service-city-suffix', { city, niche, state }));
      }
    });
  });
  
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
  
  // Sort by quality score and return top results
  return candidates
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, maxResults);
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
  
  // Generate basic variants
  const normalized = normalizeForDomain(niche);
  const variants = [normalized];
  
  // Add singular/plural variants
  if (normalized.endsWith('s')) {
    variants.push(normalized.slice(0, -1));
  } else {
    variants.push(normalized + 's');
  }
  
  // Add "service" variant
  variants.push(normalized + 'service');
  
  return variants;
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
  const qualityScore = calculateQualityScore(domain, pattern);
  const seoScore = calculateSEOScore(domain, pattern, context);
  const resaleScore = calculateResaleScore(domain, pattern);
  const reasons = generateReasons(domain, pattern, qualityScore, seoScore);
  
  return {
    domain,
    qualityScore,
    seoScore,
    resaleScore,
    reasons,
  };
}

/**
 * Calculate quality score (0-100)
 * Based on: length, readability, TLD, memorability
 */
function calculateQualityScore(domain: string, pattern: string): number {
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
  
  // Readability (no repeated characters or hard-to-read patterns)
  if (!/([a-z])\1{2,}/.test(domainName)) {
    score += 5;
  }
  
  // Memorability (simple patterns)
  if (length <= 15 && !domainName.includes('service')) {
    score += 5;
  }
  
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
  seoScore: number
): string[] {
  const reasons: string[] = [];
  const domainName = domain.replace('.com', '');
  const length = domainName.length;
  
  // Quality reasons
  if (pattern === 'exact-city-service') {
    reasons.push('Exact city + service match');
  } else if (pattern === 'service-city') {
    reasons.push('Service-first keyword order');
  } else if (pattern === 'state-service') {
    reasons.push('State-level geo match');
  }
  
  // Length reasons
  if (length <= 12) {
    reasons.push('Short and memorable');
  } else if (length <= 18) {
    reasons.push('Good length for branding');
  }
  
  // SEO reasons
  if (seoScore >= 85) {
    reasons.push('Excellent SEO potential');
  } else if (seoScore >= 70) {
    reasons.push('Strong local SEO value');
  }
  
  // TLD
  if (domain.endsWith('.com')) {
    reasons.push('.com TLD premium');
  }
  
  // Brandability
  if (!/[-0-9]/.test(domainName)) {
    reasons.push('Clean, brandable domain');
  }
  
  // Professional appeal
  if (pattern.includes('suffix')) {
    reasons.push('Professional suffix adds authority');
  }
  
  return reasons.slice(0, 4); // Limit to top 4 reasons
}
