import { DomainOpportunity, BusinessLead } from '@/types';
import { MOCK_DOMAINS, MOCK_BUSINESSES, NICHE_VARIANTS } from '@/data/mockData';

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function generateDomainPatterns(city: string, state: string, niche: string): string[] {
  const c = normalize(city);
  const s = normalize(state);
  const variants = NICHE_VARIANTS[niche.toLowerCase()] || [niche.toLowerCase()];
  const domains: string[] = [];

  for (const variant of variants) {
    const n = normalize(variant);
    domains.push(
      `${c}${n}.com`,
      `${s}${n}.com`,
      `${n}${c}.com`,
      `${n}${s}.com`,
      `${c}${n}company.com`,
      `${c}${n}pros.com`,
      `${c}${n}experts.com`,
    );
  }

  return [...new Set(domains)];
}

function scoreDomain(domain: string): { quality: number; seo: number; resale: number } {
  const len = domain.replace('.com', '').length;
  const quality = Math.max(50, 100 - (len - 10) * 2 + Math.floor(Math.random() * 10));
  const seo = Math.max(50, quality - 5 + Math.floor(Math.random() * 10));
  const resale = Math.max(40, quality - 10 + Math.floor(Math.random() * 10));
  return { quality: Math.min(100, quality), seo: Math.min(100, seo), resale: Math.min(100, resale) };
}

export async function searchDomains(niche: string, state: string, city: string): Promise<DomainOpportunity[]> {
  await new Promise(r => setTimeout(r, 1200));

  const key = `${niche.toLowerCase()}|${state.toLowerCase()}|${city.toLowerCase()}`;
  if (MOCK_DOMAINS[key]) return MOCK_DOMAINS[key];

  // Generate domains dynamically
  const patterns = generateDomainPatterns(city, state, niche);
  return patterns.slice(0, 12).map((domain, i) => {
    const scores = scoreDomain(domain);
    const statuses: DomainOpportunity['status'][] = ['available', 'available', 'available', 'taken', 'unknown'];
    return {
      id: `gen-d-${i}`,
      domain,
      tld: '.com',
      status: statuses[i % statuses.length],
      qualityScore: scores.quality,
      seoScore: scores.seo,
      resaleScore: scores.resale,
      reasons: ['Generic geo-service pattern', 'Clean .com domain', 'Local SEO potential'],
      searchQueryId: 'dynamic',
      saved: false,
    };
  });
}

export async function searchBusinesses(niche: string, state: string, city: string): Promise<BusinessLead[]> {
  await new Promise(r => setTimeout(r, 1500));

  const key = `${niche.toLowerCase()}|${state.toLowerCase()}|${city.toLowerCase()}`;
  if (MOCK_BUSINESSES[key]) return MOCK_BUSINESSES[key];

  // Return empty for unknown combos
  return [];
}

// Provider abstraction for future real API integration
export interface DomainProvider {
  checkAvailability(domain: string): Promise<DomainOpportunity['status']>;
  searchDomains(niche: string, state: string, city: string): Promise<DomainOpportunity[]>;
}

export interface BusinessProvider {
  searchBusinesses(niche: string, state: string, city: string): Promise<BusinessLead[]>;
}
