/**
 * Website Audit Service
 * Analyzes business websites to provide prospecting insights
 */

export interface WebsiteAuditResult {
  domain: string;
  signals: WebsiteSignals;
  score: number; // 0-100, overall website quality
  lastAudited: Date;
}

export interface WebsiteSignals {
  // Basic signals
  hasHttps: boolean;
  domainLength: number;
  
  // SEO signals
  hasGeoKeyword: boolean;
  hasServiceKeyword: boolean;
  geoKeywords: string[];
  serviceKeywords: string[];
  
  // Domain type
  isGeneric: boolean; // Generic geo-service domain
  isBranded: boolean; // Branded/business name domain
  
  // Technical signals
  hasWww: boolean;
  titleTag?: string;
  titleLength?: number;
  
  // Content signals
  possiblePlatform?: 'wordpress' | 'wix' | 'squarespace' | 'shopify' | 'custom';
  possibleAge?: 'new' | 'established' | 'outdated';
  
  // Quality indicators
  mobileOptimized?: boolean;
  loadTime?: number;
}

export interface WebsiteAuditContext {
  city: string;
  state: string;
  niche: string;
  businessName: string;
}

/**
 * Audit a business website for prospecting insights
 */
export async function auditWebsite(
  websiteUrl: string,
  context: WebsiteAuditContext
): Promise<WebsiteAuditResult> {
  const domain = extractDomain(websiteUrl);
  const signals = await analyzeWebsiteSignals(websiteUrl, domain, context);
  const score = calculateWebsiteScore(signals, context);
  
  return {
    domain,
    signals,
    score,
    lastAudited: new Date(),
  };
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

/**
 * Analyze website signals
 */
async function analyzeWebsiteSignals(
  websiteUrl: string,
  domain: string,
  context: WebsiteAuditContext
): Promise<WebsiteSignals> {
  const normalizedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
  
  // Basic signals from domain
  const hasHttps = normalizedUrl.startsWith('https://');
  const domainLength = domain.replace(/\.[a-z]+$/i, '').length;
  const hasWww = websiteUrl.toLowerCase().includes('www.');
  
  // Analyze domain for keywords
  const domainLower = domain.toLowerCase();
  const cityNorm = context.city.toLowerCase().replace(/\s+/g, '');
  const stateNorm = context.state.toLowerCase().replace(/\s+/g, '');
  const nicheNorm = context.niche.toLowerCase().replace(/\s+/g, '');
  
  const geoKeywords: string[] = [];
  if (domainLower.includes(cityNorm)) {
    geoKeywords.push(context.city);
  }
  if (domainLower.includes(stateNorm)) {
    geoKeywords.push(context.state);
  }
  
  const serviceKeywords: string[] = [];
  if (domainLower.includes(nicheNorm)) {
    serviceKeywords.push(context.niche);
  }
  
  const hasGeoKeyword = geoKeywords.length > 0;
  const hasServiceKeyword = serviceKeywords.length > 0;
  
  // Determine if generic or branded
  const isGeneric = hasGeoKeyword || hasServiceKeyword;
  const isBranded = !isGeneric;
  
  // Try to fetch and analyze the homepage
  let titleTag: string | undefined;
  let titleLength: number | undefined;
  let possiblePlatform: WebsiteSignals['possiblePlatform'];
  let possibleAge: WebsiteSignals['possibleAge'];
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GeoDomainScout/1.0',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const html = await response.text();
      
      // Extract title tag
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      if (titleMatch) {
        titleTag = titleMatch[1].trim();
        titleLength = titleTag.length;
      }
      
      // Detect platform
      possiblePlatform = detectPlatform(html);
      
      // Detect possible age/quality indicators
      possibleAge = detectAge(html);
    }
  } catch (error) {
    // Ignore fetch errors - signals are optional
  }
  
  return {
    hasHttps,
    domainLength,
    hasGeoKeyword,
    hasServiceKeyword,
    geoKeywords,
    serviceKeywords,
    isGeneric,
    isBranded,
    hasWww,
    titleTag,
    titleLength,
    possiblePlatform,
    possibleAge,
  };
}

/**
 * Detect website platform from HTML
 */
function detectPlatform(html: string): WebsiteSignals['possiblePlatform'] {
  const lowerHtml = html.toLowerCase();
  
  if (lowerHtml.includes('wp-content') || lowerHtml.includes('wordpress')) {
    return 'wordpress';
  }
  
  if (lowerHtml.includes('wix.com') || lowerHtml.includes('wixsite')) {
    return 'wix';
  }
  
  if (lowerHtml.includes('squarespace')) {
    return 'squarespace';
  }
  
  if (lowerHtml.includes('shopify') || lowerHtml.includes('myshopify')) {
    return 'shopify';
  }
  
  return 'custom';
}

/**
 * Detect website age/quality from HTML
 */
function detectAge(html: string): WebsiteSignals['possibleAge'] {
  const lowerHtml = html.toLowerCase();
  
  // Outdated indicators
  const outdatedIndicators = [
    '<table', // Table-based layout
    '<font', // Old font tags
    'flash',
    'marquee',
    'align="center"',
  ];
  
  const outdatedCount = outdatedIndicators.filter(indicator => 
    lowerHtml.includes(indicator)
  ).length;
  
  if (outdatedCount >= 2) {
    return 'outdated';
  }
  
  // Modern indicators
  const modernIndicators = [
    'viewport',
    'responsive',
    'bootstrap',
    'react',
    'vue',
    'angular',
    'tailwind',
  ];
  
  const modernCount = modernIndicators.filter(indicator =>
    lowerHtml.includes(indicator)
  ).length;
  
  if (modernCount >= 2) {
    return 'new';
  }
  
  return 'established';
}

/**
 * Calculate overall website score
 */
function calculateWebsiteScore(
  signals: WebsiteSignals,
  context: WebsiteAuditContext
): number {
  let score = 50; // Base score
  
  // HTTPS bonus
  if (signals.hasHttps) {
    score += 10;
  } else {
    score -= 15; // Penalty for no HTTPS
  }
  
  // Domain length (shorter is better for SEO)
  if (signals.domainLength <= 15) {
    score += 10;
  } else if (signals.domainLength <= 20) {
    score += 5;
  } else if (signals.domainLength > 30) {
    score -= 10;
  }
  
  // SEO keyword presence
  if (signals.hasGeoKeyword) {
    score += 15;
  } else {
    score -= 10; // Missing geo optimization
  }
  
  if (signals.hasServiceKeyword) {
    score += 15;
  } else {
    score -= 10; // Missing service optimization
  }
  
  // Title tag quality
  if (signals.titleTag) {
    if (signals.titleLength && signals.titleLength >= 30 && signals.titleLength <= 60) {
      score += 10; // Good title length
    } else if (signals.titleLength && signals.titleLength < 20) {
      score -= 5; // Too short
    }
  } else {
    score -= 10; // Missing title
  }
  
  // Platform consideration
  if (signals.possiblePlatform) {
    if (signals.possiblePlatform === 'custom') {
      score += 5; // Custom sites often better
    } else if (signals.possiblePlatform === 'wix') {
      score -= 5; // Wix sites often lower quality for local biz
    }
  }
  
  // Age/quality
  if (signals.possibleAge === 'outdated') {
    score -= 15; // Outdated site is a weakness
  } else if (signals.possibleAge === 'new') {
    score += 10; // Modern site
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Generate audit insights for prospecting
 */
export function generateAuditInsights(
  auditResult: WebsiteAuditResult,
  context: WebsiteAuditContext
): string[] {
  const insights: string[] = [];
  const { signals, score } = auditResult;
  
  // Weak signals = opportunities
  if (!signals.hasHttps) {
    insights.push('⚠️ No HTTPS - security concern for customers');
  }
  
  if (!signals.hasGeoKeyword) {
    insights.push('📍 Missing geographic keywords - weak local SEO');
  }
  
  if (!signals.hasServiceKeyword) {
    insights.push('🔍 Missing service keywords - poor search visibility');
  }
  
  if (signals.domainLength > 25) {
    insights.push('📏 Domain too long - hard to remember and share');
  }
  
  if (signals.possibleAge === 'outdated') {
    insights.push('⏰ Outdated website technology detected');
  }
  
  if (!signals.titleTag || (signals.titleLength && signals.titleLength < 20)) {
    insights.push('📄 Weak or missing title tag - SEO issue');
  }
  
  // Strong signals
  if (score >= 80) {
    insights.push('✅ Strong web presence - pitch premium positioning');
  } else if (score <= 40) {
    insights.push('💎 Major upgrade opportunity - emphasize ROI');
  }
  
  return insights;
}
