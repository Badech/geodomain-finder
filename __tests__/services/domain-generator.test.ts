/**
 * Unit tests for Domain Generator Service
 */

import { describe, it, expect } from 'vitest';
import { DomainGenerator } from '../../lib/services/domain-generator';

describe('DomainGenerator', () => {
  const generator = new DomainGenerator();

  describe('generateDomains', () => {
    it('should generate domains from niche and location', () => {
      const domains = generator.generateDomains({
        niche: 'plumber',
        city: 'Miami',
        state: 'Florida',
        tlds: ['.com'],
        maxResults: 5,
      });

      expect(domains).toHaveLength(5);
      expect(domains[0]).toHaveProperty('domain');
      expect(domains[0]).toHaveProperty('qualityScore');
      expect(domains[0]).toHaveProperty('seoScore');
      expect(domains[0]).toHaveProperty('resaleScore');
    });

    it('should include city name in domains', () => {
      const domains = generator.generateDomains({
        niche: 'plumber',
        city: 'Miami',
        state: 'Florida',
        tlds: ['.com'],
        maxResults: 10,
      });

      const hasMiami = domains.some(d => d.domain.includes('miami'));
      expect(hasMiami).toBe(true);
    });

    it('should apply modifiers when provided', () => {
      const domains = generator.generateDomains({
        niche: 'plumber',
        city: 'Miami',
        state: 'Florida',
        modifiers: ['best', 'top'],
        tlds: ['.com'],
        maxResults: 10,
      });

      const hasModifier = domains.some(d => 
        d.domain.includes('best') || d.domain.includes('top')
      );
      expect(hasModifier).toBe(true);
    });

    it('should generate valid domain formats', () => {
      const domains = generator.generateDomains({
        niche: 'plumber',
        city: 'Miami',
        state: 'Florida',
        tlds: ['.com'],
        maxResults: 10,
      });

      domains.forEach(domain => {
        // Should match domain pattern
        expect(domain.domain).toMatch(/^[a-z0-9-]+\.[a-z]+$/);
        // Should not have consecutive hyphens
        expect(domain.domain).not.toMatch(/--/);
        // Should not start or end with hyphen
        expect(domain.domain).not.toMatch(/^-|-\./);
      });
    });

    it('should assign quality scores between 0-100', () => {
      const domains = generator.generateDomains({
        niche: 'plumber',
        city: 'Miami',
        state: 'Florida',
        tlds: ['.com'],
        maxResults: 10,
      });

      domains.forEach(domain => {
        expect(domain.qualityScore).toBeGreaterThanOrEqual(0);
        expect(domain.qualityScore).toBeLessThanOrEqual(100);
        expect(domain.seoScore).toBeGreaterThanOrEqual(0);
        expect(domain.seoScore).toBeLessThanOrEqual(100);
        expect(domain.resaleScore).toBeGreaterThanOrEqual(0);
        expect(domain.resaleScore).toBeLessThanOrEqual(100);
      });
    });

    it('should handle multiple TLDs', () => {
      const domains = generator.generateDomains({
        niche: 'plumber',
        city: 'Miami',
        state: 'Florida',
        tlds: ['.com', '.net', '.org'],
        maxResults: 15,
      });

      const hasCom = domains.some(d => d.tld === '.com');
      const hasNet = domains.some(d => d.tld === '.net');
      const hasOrg = domains.some(d => d.tld === '.org');

      expect(hasCom).toBe(true);
      expect(hasNet).toBe(true);
      expect(hasOrg).toBe(true);
    });
  });
});
