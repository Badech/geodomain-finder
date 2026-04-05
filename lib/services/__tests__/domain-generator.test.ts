import { describe, it, expect } from 'vitest';
import { generateDomainCandidates } from '../domain-generator';

describe('Domain Generator Service', () => {
  describe('generateDomainCandidates', () => {
    it('should generate domain candidates for car detailing in Richmond, VA', () => {
      const candidates = generateDomainCandidates({
        niche: 'car detailing',
        city: 'Richmond',
        state: 'Virginia',
        maxResults: 10,
      });

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates.length).toBeLessThanOrEqual(10);

      candidates.forEach(candidate => {
        expect(candidate.domain).toBeTruthy();
        expect(candidate.domain).toMatch(/\.com$/);
        expect(candidate.qualityScore).toBeGreaterThanOrEqual(0);
        expect(candidate.qualityScore).toBeLessThanOrEqual(100);
        expect(candidate.seoScore).toBeGreaterThanOrEqual(0);
        expect(candidate.seoScore).toBeLessThanOrEqual(100);
        expect(candidate.resaleScore).toBeGreaterThanOrEqual(0);
        expect(candidate.resaleScore).toBeLessThanOrEqual(100);
        expect(candidate.reasons).toBeInstanceOf(Array);
        expect(candidate.reasons.length).toBeGreaterThan(0);
      });
    });

    it('should include city name in generated domains', () => {
      const candidates = generateDomainCandidates({
        niche: 'roofing',
        city: 'Tampa',
        state: 'Florida',
        maxResults: 20,
      });

      const domainsWithCity = candidates.filter(c =>
        c.domain.toLowerCase().includes('tampa')
      );

      expect(domainsWithCity.length).toBeGreaterThan(0);
    });

    it('should include niche keywords in generated domains', () => {
      const candidates = generateDomainCandidates({
        niche: 'hvac',
        city: 'Phoenix',
        state: 'Arizona',
        maxResults: 20,
      });

      const domainsWithNiche = candidates.filter(c =>
        c.domain.toLowerCase().includes('hvac') ||
        c.domain.toLowerCase().includes('heating') ||
        c.domain.toLowerCase().includes('cooling')
      );

      expect(domainsWithNiche.length).toBeGreaterThan(0);
    });

    it('should sort results by quality score', () => {
      const candidates = generateDomainCandidates({
        niche: 'plumbing',
        city: 'Austin',
        state: 'Texas',
        maxResults: 10,
      });

      // Check if sorted in descending order
      for (let i = 0; i < candidates.length - 1; i++) {
        expect(candidates[i].qualityScore).toBeGreaterThanOrEqual(
          candidates[i + 1].qualityScore
        );
      }
    });

    it('should respect maxResults parameter', () => {
      const candidates = generateDomainCandidates({
        niche: 'landscaping',
        city: 'Seattle',
        state: 'Washington',
        maxResults: 5,
      });

      expect(candidates.length).toBeLessThanOrEqual(5);
    });

    it('should generate domains with custom modifiers', () => {
      const candidates = generateDomainCandidates({
        niche: 'cleaning',
        city: 'Denver',
        state: 'Colorado',
        modifiers: ['eco', 'green'],
        maxResults: 20,
      });

      const withModifiers = candidates.filter(c =>
        c.domain.includes('eco') || c.domain.includes('green')
      );

      expect(withModifiers.length).toBeGreaterThan(0);
    });

    it('should include .com TLD for all domains', () => {
      const candidates = generateDomainCandidates({
        niche: 'pest control',
        city: 'Miami',
        state: 'Florida',
        maxResults: 10,
      });

      candidates.forEach(candidate => {
        expect(candidate.domain).toMatch(/\.com$/);
      });
    });

    it('should not include spaces or special characters in domains', () => {
      const candidates = generateDomainCandidates({
        niche: 'car detailing',
        city: 'New York',
        state: 'New York',
        maxResults: 10,
      });

      candidates.forEach(candidate => {
        expect(candidate.domain).toMatch(/^[a-z0-9]+\.com$/);
      });
    });

    it('should generate unique domains', () => {
      const candidates = generateDomainCandidates({
        niche: 'roofing',
        city: 'Boston',
        state: 'Massachusetts',
        maxResults: 20,
      });

      const domains = candidates.map(c => c.domain);
      const uniqueDomains = new Set(domains);

      expect(uniqueDomains.size).toBe(domains.length);
    });

    it('should include scoring reasons', () => {
      const candidates = generateDomainCandidates({
        niche: 'electrician',
        city: 'Portland',
        state: 'Oregon',
        maxResults: 5,
      });

      candidates.forEach(candidate => {
        expect(candidate.reasons.length).toBeGreaterThan(0);
        candidate.reasons.forEach(reason => {
          expect(typeof reason).toBe('string');
          expect(reason.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
