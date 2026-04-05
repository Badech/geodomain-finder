/**
 * Unit tests for Business Matcher Service
 */

import { describe, it, expect } from 'vitest';
import { BusinessMatcher } from '../../lib/services/business-matcher';

describe('BusinessMatcher', () => {
  const matcher = new BusinessMatcher();

  const sampleDomains = [
    {
      domain: 'miamiplumber.com',
      tld: '.com',
      qualityScore: 85,
      seoScore: 80,
      resaleScore: 75,
      reasons: ['Geo + service name', 'High SEO score'],
    },
    {
      domain: 'floridaplumbing.com',
      tld: '.com',
      qualityScore: 75,
      seoScore: 70,
      resaleScore: 65,
      reasons: ['State + service name'],
    },
  ];

  const sampleBusinesses = [
    {
      id: 'biz1',
      name: 'ABC Plumbing',
      city: 'Miami',
      state: 'Florida',
      niche: 'plumber',
      phone: '305-555-0100',
      email: null,
      website: null,
      address: '123 Main St, Miami, FL',
      rating: 4.5,
      reviewCount: 120,
      currentDomain: null,
      buyerScore: 0,
      tags: [],
      scoreReasons: [],
    },
  ];

  describe('matchBusinessesToDomains', () => {
    it('should create matches between domains and businesses', () => {
      const matches = matcher.matchBusinessesToDomains(sampleDomains, sampleBusinesses);

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toHaveProperty('businessLeadId');
      expect(matches[0]).toHaveProperty('domain');
      expect(matches[0]).toHaveProperty('fitScore');
    });

    it('should assign fit scores between 0-100', () => {
      const matches = matcher.matchBusinessesToDomains(sampleDomains, sampleBusinesses);

      matches.forEach(match => {
        expect(match.fitScore).toBeGreaterThanOrEqual(0);
        expect(match.fitScore).toBeLessThanOrEqual(100);
      });
    });

    it('should include match reasons', () => {
      const matches = matcher.matchBusinessesToDomains(sampleDomains, sampleBusinesses);

      matches.forEach(match => {
        expect(match.reasons).toBeDefined();
        expect(Array.isArray(match.reasons)).toBe(true);
        expect(match.reasons.length).toBeGreaterThan(0);
      });
    });

    it('should prefer exact city match', () => {
      const matches = matcher.matchBusinessesToDomains(sampleDomains, sampleBusinesses);
      
      // miamiplumber.com should score higher for Miami business
      const miamiMatch = matches.find(m => m.domain === 'miamiplumber.com');
      const floridaMatch = matches.find(m => m.domain === 'floridaplumbing.com');

      if (miamiMatch && floridaMatch) {
        expect(miamiMatch.fitScore).toBeGreaterThanOrEqual(floridaMatch.fitScore);
      }
    });
  });

  describe('calculateBuyerScore', () => {
    it('should calculate buyer score for business without website', () => {
      const business = { ...sampleBusinesses[0], website: null };
      const score = matcher.calculateBuyerScore(business);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give higher score to businesses without website', () => {
      const withoutWebsite = { ...sampleBusinesses[0], website: null };
      const withWebsite = { ...sampleBusinesses[0], website: 'https://example.com' };

      const scoreWithout = matcher.calculateBuyerScore(withoutWebsite);
      const scoreWith = matcher.calculateBuyerScore(withWebsite);

      expect(scoreWithout).toBeGreaterThan(scoreWith);
    });

    it('should consider rating in buyer score', () => {
      const highRating = { ...sampleBusinesses[0], rating: 4.8, reviewCount: 200 };
      const lowRating = { ...sampleBusinesses[0], rating: 3.0, reviewCount: 10 };

      const highScore = matcher.calculateBuyerScore(highRating);
      const lowScore = matcher.calculateBuyerScore(lowRating);

      expect(highScore).toBeGreaterThan(lowScore);
    });
  });
});
