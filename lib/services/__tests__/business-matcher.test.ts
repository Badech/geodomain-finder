import { describe, it, expect } from 'vitest';
import {
  calculateBuyerScore,
  scoreBusinessLeads,
  matchDomainsToBusinesses,
  rankBusinessesByBuyerScore,
  BusinessLead,
} from '../business-matcher';
import { DomainCandidate } from '../domain-generator';

describe('Business Matcher Service', () => {
  const createMockLead = (overrides: Partial<BusinessLead> = {}): BusinessLead => ({
    id: 'lead1',
    name: 'Test Business',
    niche: 'car detailing',
    city: 'Richmond',
    state: 'Virginia',
    address: '123 Main St',
    rating: 4.5,
    reviewCount: 100,
    ...overrides,
  });

  const createMockDomain = (overrides: Partial<DomainCandidate> = {}): DomainCandidate => ({
    domain: 'richmondcardetailing.com',
    qualityScore: 85,
    seoScore: 90,
    resaleScore: 80,
    reasons: ['Exact city + service match', '.com TLD premium'],
    ...overrides,
  });

  describe('calculateBuyerScore', () => {
    it('should give high score to business with no website', () => {
      const lead = createMockLead({
        website: undefined,
        rating: 4.8,
        reviewCount: 200,
      });

      const scored = calculateBuyerScore(lead);

      expect(scored.buyerScore).toBeGreaterThan(70);
      expect(scored.scoreReasons).toContain('No website - perfect opportunity for domain upgrade');
    });

    it('should give high score to business with Wix subdomain', () => {
      const lead = createMockLead({
        website: 'mybusiness.wixsite.com',
        currentDomain: 'mybusiness.wixsite.com',
      });

      const scored = calculateBuyerScore(lead);

      expect(scored.buyerScore).toBeGreaterThan(60);
      expect(scored.scoreReasons.some(r => r.includes('Wix'))).toBe(true);
    });

    it('should give high score to business with Weebly subdomain', () => {
      const lead = createMockLead({
        website: 'mybusiness.weebly.com',
        currentDomain: 'mybusiness.weebly.com',
      });

      const scored = calculateBuyerScore(lead);

      expect(scored.buyerScore).toBeGreaterThan(60);
      expect(scored.scoreReasons.some(r => r.includes('Weebly'))).toBe(true);
    });

    it('should factor in excellent ratings', () => {
      const lead = createMockLead({
        rating: 4.8,
        reviewCount: 250,
        website: undefined,
      });

      const scored = calculateBuyerScore(lead);

      expect(scored.scoreReasons.some(r => r.includes('Excellent rating'))).toBe(true);
    });

    it('should factor in high review count', () => {
      const lead = createMockLead({
        rating: 4.5,
        reviewCount: 300,
        website: undefined,
      });

      const scored = calculateBuyerScore(lead);

      expect(scored.scoreReasons.some(r => r.includes('review'))).toBe(true);
    });

    it('should detect long domain names', () => {
      const lead = createMockLead({
        website: 'myverylongbusinessnamecompany.com',
        currentDomain: 'myverylongbusinessnamecompany.com',
      });

      const scored = calculateBuyerScore(lead);

      expect(scored.scoreReasons.some(r => r.includes('Long domain'))).toBe(true);
    });

    it('should detect hyphens in domain', () => {
      const lead = createMockLead({
        website: 'my-business-name.com',
        currentDomain: 'my-business-name.com',
      });

      const scored = calculateBuyerScore(lead);

      expect(scored.scoreReasons.some(r => r.includes('hyphens'))).toBe(true);
    });

    it('should detect non-.com domains', () => {
      const lead = createMockLead({
        website: 'mybusiness.net',
        currentDomain: 'mybusiness.net',
      });

      const scored = calculateBuyerScore(lead);

      expect(scored.scoreReasons.some(r => r.includes('.com'))).toBe(true);
    });

    it('should give points for email contact', () => {
      const lead = createMockLead({
        email: 'contact@business.com',
        website: undefined,
      });

      const scored = calculateBuyerScore(lead);

      expect(scored.scoreReasons.some(r => r.includes('email'))).toBe(true);
    });

    it('should return score between 0 and 100', () => {
      const leads = [
        createMockLead({ website: undefined, rating: 0, reviewCount: 0 }),
        createMockLead({ website: 'business.wixsite.com', rating: 5, reviewCount: 500 }),
        createMockLead({ website: 'mybusiness.com', rating: 4.5, reviewCount: 100 }),
      ];

      leads.forEach(lead => {
        const scored = calculateBuyerScore(lead);
        expect(scored.buyerScore).toBeGreaterThanOrEqual(0);
        expect(scored.buyerScore).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('scoreBusinessLeads', () => {
    it('should score multiple leads', () => {
      const leads = [
        createMockLead({ id: '1', name: 'Business 1' }),
        createMockLead({ id: '2', name: 'Business 2' }),
        createMockLead({ id: '3', name: 'Business 3' }),
      ];

      const scored = scoreBusinessLeads(leads);

      expect(scored).toHaveLength(3);
      scored.forEach(lead => {
        expect(lead.buyerScore).toBeDefined();
        expect(lead.scoreReasons).toBeInstanceOf(Array);
      });
    });
  });

  describe('rankBusinessesByBuyerScore', () => {
    it('should sort businesses by buyer score descending', () => {
      const leads = [
        { ...createMockLead({ id: '1' }), buyerScore: 50, scoreReasons: [] },
        { ...createMockLead({ id: '2' }), buyerScore: 80, scoreReasons: [] },
        { ...createMockLead({ id: '3' }), buyerScore: 65, scoreReasons: [] },
      ];

      const ranked = rankBusinessesByBuyerScore(leads);

      expect(ranked[0].buyerScore).toBe(80);
      expect(ranked[1].buyerScore).toBe(65);
      expect(ranked[2].buyerScore).toBe(50);
    });

    it('should filter by minimum score', () => {
      const leads = [
        { ...createMockLead({ id: '1' }), buyerScore: 50, scoreReasons: [] },
        { ...createMockLead({ id: '2' }), buyerScore: 80, scoreReasons: [] },
        { ...createMockLead({ id: '3' }), buyerScore: 40, scoreReasons: [] },
      ];

      const ranked = rankBusinessesByBuyerScore(leads, 60);

      expect(ranked).toHaveLength(1);
      expect(ranked[0].buyerScore).toBe(80);
    });
  });

  describe('matchDomainsToBusinesses', () => {
    it('should match domains to businesses', () => {
      const domains = [
        createMockDomain({ domain: 'richmondcardetailing.com', qualityScore: 90 }),
        createMockDomain({ domain: 'virginiadetailing.com', qualityScore: 85 }),
      ];

      const businesses = [
        {
          ...createMockLead({ id: 'b1', website: undefined }),
          buyerScore: 80,
          scoreReasons: [],
        },
        {
          ...createMockLead({ id: 'b2', website: 'business.wixsite.com' }),
          buyerScore: 85,
          scoreReasons: [],
        },
      ];

      const matches = matchDomainsToBusinesses(domains, businesses);

      expect(matches.length).toBeGreaterThan(0);
      matches.forEach(match => {
        expect(match.businessLeadId).toBeTruthy();
        expect(match.domain).toBeTruthy();
        expect(match.fitScore).toBeGreaterThan(0);
        expect(match.matchReason).toBeTruthy();
        expect(match.reasons).toBeInstanceOf(Array);
      });
    });

    it('should only return matches with fit score > 50', () => {
      const domains = [createMockDomain()];
      const businesses = [
        {
          ...createMockLead(),
          buyerScore: 80,
          scoreReasons: [],
        },
      ];

      const matches = matchDomainsToBusinesses(domains, businesses);

      matches.forEach(match => {
        expect(match.fitScore).toBeGreaterThan(50);
      });
    });

    it('should generate appropriate match reasons', () => {
      const domains = [createMockDomain()];
      const businesses = [
        {
          ...createMockLead({ website: undefined }),
          buyerScore: 80,
          scoreReasons: [],
        },
      ];

      const matches = matchDomainsToBusinesses(domains, businesses);

      expect(matches[0].matchReason).toContain('No website');
    });
  });
});
