/**
 * Niche normalization and query expansion for better business search coverage
 */

export interface NicheSearchVariants {
  primary: string;
  variants: string[];
  categories: string[];
}

/**
 * Normalize and expand niche terms for comprehensive business search
 */
export function expandNicheForSearch(niche: string): NicheSearchVariants {
  const normalized = niche.toLowerCase().trim();
  
  // Predefined expansions for common niches
  const expansions: Record<string, NicheSearchVariants> = {
    'car': {
      primary: 'car detailing',
      variants: ['auto detailing', 'car wash', 'auto care', 'car care'],
      categories: ['car_dealer', 'car_wash', 'car_repair'],
    },
    'car detailing': {
      primary: 'car detailing',
      variants: ['auto detailing', 'car wash', 'mobile car detailing'],
      categories: ['car_wash', 'car_repair'],
    },
    'roofing': {
      primary: 'roofing',
      variants: ['roofer', 'roof repair', 'roofing contractor', 'roofing company'],
      categories: ['roofing_contractor'],
    },
    'hvac': {
      primary: 'HVAC',
      variants: ['heating and cooling', 'air conditioning', 'HVAC contractor', 'heating contractor'],
      categories: ['hvac_contractor'],
    },
    'plumbing': {
      primary: 'plumbing',
      variants: ['plumber', 'plumbing service', 'plumbing contractor', 'plumbing company'],
      categories: ['plumber'],
    },
    'landscaping': {
      primary: 'landscaping',
      variants: ['landscape', 'lawn care', 'lawn service', 'landscaping service'],
      categories: ['landscaper'],
    },
    'electrician': {
      primary: 'electrician',
      variants: ['electrical service', 'electrical contractor', 'electric'],
      categories: ['electrician'],
    },
    'pest control': {
      primary: 'pest control',
      variants: ['exterminator', 'pest removal', 'pest management'],
      categories: ['pest_control_service'],
    },
    'cleaning': {
      primary: 'cleaning',
      variants: ['cleaning service', 'house cleaning', 'commercial cleaning', 'maid service'],
      categories: ['house_cleaning_service'],
    },
    'painting': {
      primary: 'painting',
      variants: ['painter', 'painting contractor', 'painting service', 'house painting'],
      categories: ['painter'],
    },
    'flooring': {
      primary: 'flooring',
      variants: ['flooring contractor', 'floor installation', 'flooring service'],
      categories: ['flooring_contractor'],
    },
    'windows': {
      primary: 'window service',
      variants: ['window installation', 'window replacement', 'window repair'],
      categories: ['window_installation_service'],
    },
  };
  
  // Check for exact match
  if (expansions[normalized]) {
    return expansions[normalized];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(expansions)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // Default: use the input as-is with basic variants
  return {
    primary: niche,
    variants: [niche, `${niche} service`, `${niche} company`],
    categories: [],
  };
}

/**
 * Generate search query variations for better business coverage
 */
export function generateSearchQueries(niche: string, city: string, state: string): string[] {
  const expanded = expandNicheForSearch(niche);
  const queries: Set<string> = new Set(); // Use Set to prevent duplicates
  
  // Primary query
  queries.add(`${expanded.primary} in ${city}, ${state}`);
  
  // Variant queries (limit to top 2 to avoid too many API calls)
  expanded.variants.slice(0, 2).forEach(variant => {
    queries.add(`${variant} in ${city}, ${state}`);
  });
  
  // Add city-only queries for broader coverage if we have few variants
  if (expanded.variants.length < 2) {
    queries.add(`${expanded.primary} ${city}`);
  }
  
  // Convert Set back to array and log deduplication
  const uniqueQueries = Array.from(queries);
  const duplicatesRemoved = expanded.variants.length + 1 - uniqueQueries.length;
  
  if (duplicatesRemoved > 0) {
    console.log(`[NicheNormalizer] Removed ${duplicatesRemoved} duplicate queries`);
  }
  
  return uniqueQueries;
}
