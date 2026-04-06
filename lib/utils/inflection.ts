/**
 * Natural language inflection utilities
 * Handles pluralization, singularization, and natural word forms
 */

// Common irregular plurals
const IRREGULAR_PLURALS: Record<string, string> = {
  'child': 'children',
  'person': 'people',
  'man': 'men',
  'woman': 'women',
  'tooth': 'teeth',
  'foot': 'feet',
  'mouse': 'mice',
  'goose': 'geese',
};

const IRREGULAR_SINGULARS: Record<string, string> = {
  'children': 'child',
  'people': 'person',
  'men': 'man',
  'women': 'woman',
  'teeth': 'tooth',
  'feet': 'foot',
  'mice': 'mouse',
  'geese': 'goose',
};

// Uncountable nouns (same in singular and plural)
const UNCOUNTABLE = new Set([
  'equipment',
  'information',
  'rice',
  'money',
  'species',
  'series',
  'fish',
  'sheep',
  'police',
  'deer',
  'moose',
]);

/**
 * Get the singular form of a word
 */
export function singularize(word: string): string {
  const lower = word.toLowerCase();
  
  // Check if uncountable
  if (UNCOUNTABLE.has(lower)) {
    return word;
  }
  
  // Check irregular forms
  if (IRREGULAR_SINGULARS[lower]) {
    return preserveCase(word, IRREGULAR_SINGULARS[lower]);
  }
  
  // Handle regular patterns
  if (lower.endsWith('ies') && lower.length > 4) {
    // cities -> city, ladies -> lady
    return word.slice(0, -3) + 'y';
  }
  
  if (lower.endsWith('oes')) {
    // heroes -> hero, potatoes -> potato
    return word.slice(0, -2);
  }
  
  if (lower.endsWith('ses') && lower.length > 4) {
    // cases -> case, horses -> horse
    return word.slice(0, -2);
  }
  
  if (lower.endsWith('sses')) {
    // glasses -> glass, classes -> class
    return word.slice(0, -2);
  }
  
  if (lower.endsWith('xes')) {
    // boxes -> box, fixes -> fix
    return word.slice(0, -2);
  }
  
  if (lower.endsWith('ches') || lower.endsWith('shes')) {
    // churches -> church, wishes -> wish
    return word.slice(0, -2);
  }
  
  if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 2) {
    // cars -> car, plumbers -> plumber
    return word.slice(0, -1);
  }
  
  return word;
}

/**
 * Get the plural form of a word
 */
export function pluralize(word: string): string {
  const lower = word.toLowerCase();
  
  // Check if uncountable
  if (UNCOUNTABLE.has(lower)) {
    return word;
  }
  
  // Check irregular forms
  if (IRREGULAR_PLURALS[lower]) {
    return preserveCase(word, IRREGULAR_PLURALS[lower]);
  }
  
  // Already plural?
  if (lower.endsWith('s')) {
    return word;
  }
  
  // Handle regular patterns
  if (lower.endsWith('y') && !isVowel(lower[lower.length - 2])) {
    // city -> cities, lady -> ladies
    return word.slice(0, -1) + 'ies';
  }
  
  if (lower.endsWith('o') && !isVowel(lower[lower.length - 2])) {
    // hero -> heroes, potato -> potatoes
    return word + 'es';
  }
  
  if (lower.endsWith('s') || lower.endsWith('x') || lower.endsWith('z') || 
      lower.endsWith('ch') || lower.endsWith('sh')) {
    // glass -> glasses, box -> boxes, church -> churches
    return word + 'es';
  }
  
  if (lower.endsWith('f')) {
    // leaf -> leaves, half -> halves
    return word.slice(0, -1) + 'ves';
  }
  
  if (lower.endsWith('fe')) {
    // knife -> knives, life -> lives
    return word.slice(0, -2) + 'ves';
  }
  
  // Default: just add 's'
  return word + 's';
}

/**
 * Check if a word sounds natural in a domain name context
 */
export function isNaturalDomainWord(word: string, context: 'service' | 'modifier' | 'location'): boolean {
  const lower = word.toLowerCase();
  
  // Service context - avoid awkward plurals
  if (context === 'service') {
    // Avoid ugly plural forms
    const awkwardPatterns = [
      /s{2,}$/,        // double/triple s at end (carwashs)
      /ings$/,         // detailings, cleanings (often sounds forced)
      /als$/,          // electricals, medicals (sounds unnatural)
      /ors$/,          // contractors, realtors (better singular)
      /ers$/,          // plumbers, painters (context dependent)
    ];
    
    for (const pattern of awkwardPatterns) {
      if (pattern.test(lower)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Get the most natural form of a service word for domain names
 */
export function getNaturalServiceForm(word: string): string {
  const lower = word.toLowerCase();
  const singular = singularize(word);
  const singularLower = singular.toLowerCase();
  
  // For many services, singular is more natural
  // "dentalclinic" better than "dentalsclinic"
  // "carwash" better than "carwashs"
  
  // If singular form is much more common/natural
  const preferSingular = [
    'carwash',
    'dental',
    'medical',
    'auto',
    'plumbing',
    'roofing',
    'cleaning',
    'detailing',
    'electrical',
    'hvac',
    'clinic',
    'repair',
    'service',
  ];
  
  if (preferSingular.some(s => singularLower.includes(s) || singularLower === s)) {
    return singular;
  }
  
  // If the plural sounds awkward, use singular
  if (!isNaturalDomainWord(word, 'service')) {
    return singular;
  }
  
  return word;
}

/**
 * Helper to preserve original case pattern
 */
function preserveCase(original: string, transformed: string): string {
  if (original[0] === original[0].toUpperCase()) {
    return transformed[0].toUpperCase() + transformed.slice(1);
  }
  return transformed;
}

/**
 * Check if character is a vowel
 */
function isVowel(char: string): boolean {
  return /[aeiou]/i.test(char);
}

/**
 * Generate intelligent variants for domain generation
 * Returns only natural-sounding variants
 */
export function generateNaturalVariants(word: string): string[] {
  const variants: string[] = [];
  const lower = word.toLowerCase();
  
  // Always include the original
  variants.push(word);
  
  // Get singular and plural forms
  const singular = singularize(word);
  const plural = pluralize(word);
  
  // Add singular if different and natural
  if (singular !== word && isNaturalDomainWord(singular, 'service')) {
    variants.push(singular);
  }
  
  // Add plural if different and natural
  if (plural !== word && isNaturalDomainWord(plural, 'service')) {
    variants.push(plural);
  }
  
  // For services, try natural service form
  const naturalForm = getNaturalServiceForm(word);
  if (naturalForm !== word && !variants.includes(naturalForm)) {
    variants.push(naturalForm);
  }
  
  // Remove duplicates and awkward forms
  return Array.from(new Set(variants))
    .filter(v => isNaturalDomainWord(v, 'service'))
    .slice(0, 3); // Limit to top 3 variants
}
