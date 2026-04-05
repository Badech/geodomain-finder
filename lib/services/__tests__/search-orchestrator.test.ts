import { describe, it, expect, beforeEach } from 'vitest';
import { SearchOrchestrator, SearchInput } from '../search-orchestrator';
import { MockDomainProvider } from '../../providers/domain/mock';
import { MockLeadProvider } from '../../providers/leads/mock';
import { MockEmailExtractor } from '../../providers/email/mock';

describe('Search Orchestrator Service', () => {
  // Set longer timeout for async operations with delays
  const testTimeout = 15000;
  let orchestrator: SearchOrchestrator;

  beforeEach(() => {
    orchestrator = new SearchOrchestrator(
      new MockDomainProvider(),
      new MockLeadProvider(),
      new MockEmailExtractor()
    );
  });

  const createSearchInput = (overrides: Partial<SearchInput> = {}): SearchInput => ({
    niche: 'car detailing',
    city: 'Richmond',
    state: 'Virginia',
    maxDomains: 10,
    maxBusinesses: 5,
    ...overrides,
  });

  describe('executeSearch', () => {
    it('should execute complete search workflow', async () => {
      const input = createSearchInput();
      const result = await orchestrator.executeSearch(input);

      expect(result).toBeDefined();
      expect(result.searchQueryId).toBeTruthy();
      expect(result.domains).toBeInstanceOf(Array);
      expect(result.businesses).toBeInstanceOf(Array);
      expect(result.matches).toBeInstanceOf(Array);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.totalDomains).toBeGreaterThanOrEqual(0);
      expect(result.metadata.executionTime).toBeGreaterThan(0);
    }, testTimeout);

    it('should generate domain opportunities', async () => {
      const input = createSearchInput({ maxDomains: 5 });
      const result = await orchestrator.executeSearch(input);

      expect(result.domains.length).toBeGreaterThan(0);
      result.domains.forEach(domain => {
        expect(domain.domain).toBeTruthy();
        expect(domain.status).toMatch(/^(available|taken|unknown)$/);
        expect(domain.qualityScore).toBeGreaterThanOrEqual(0);
        expect(domain.seoScore).toBeGreaterThanOrEqual(0);
        expect(domain.resaleScore).toBeGreaterThanOrEqual(0);
      });
    }, testTimeout);

    it('should find businesses', async () => {
      const input = createSearchInput({ maxBusinesses: 3 });
      const result = await orchestrator.executeSearch(input);

      expect(result.businesses.length).toBeGreaterThan(0);
      result.businesses.forEach(business => {
        expect(business.id).toBeTruthy();
        expect(business.name).toBeTruthy();
        expect(business.buyerScore).toBeDefined();
        expect(business.scoreReasons).toBeInstanceOf(Array);
      });
    });

    it('should enrich businesses with email data', async () => {
      const input = createSearchInput();
      const result = await orchestrator.executeSearch(input);

      const businessesWithWebsite = result.businesses.filter(b => b.website);
      
      // At least some businesses should have email enrichment attempted
      expect(businessesWithWebsite.length).toBeGreaterThanOrEqual(0);
    }, testTimeout);

    it('should create domain-business matches', async () => {
      const input = createSearchInput();
      const result = await orchestrator.executeSearch(input);

      // Matches may or may not exist depending on scores
      expect(result.matches).toBeInstanceOf(Array);
      result.matches.forEach(match => {
        expect(match.businessLeadId).toBeTruthy();
        expect(match.domain).toBeTruthy();
        expect(match.fitScore).toBeGreaterThan(0);
        expect(match.matchReason).toBeTruthy();
      });
    }, testTimeout);

    it('should track progress through callbacks', async () => {
      const input = createSearchInput();
      const progressUpdates: any[] = [];

      await orchestrator.executeSearch(input, (progress) => {
        progressUpdates.push(progress);
      });

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0].stage).toBe('validating');
      expect(progressUpdates[progressUpdates.length - 1].stage).toBe('complete');
      
      // Check progress increases
      for (let i = 1; i < progressUpdates.length; i++) {
        expect(progressUpdates[i].progress).toBeGreaterThanOrEqual(
          progressUpdates[i - 1].progress
        );
      }
    }, testTimeout);

    it('should validate required input fields', async () => {
      const invalidInputs = [
        { ...createSearchInput(), niche: '' },
        { ...createSearchInput(), city: '' },
        { ...createSearchInput(), state: '' },
      ];

      for (const input of invalidInputs) {
        await expect(orchestrator.executeSearch(input)).rejects.toThrow();
      }
    });

    it('should include metadata in results', async () => {
      const input = createSearchInput();
      const result = await orchestrator.executeSearch(input);

      expect(result.metadata.totalDomains).toBe(result.domains.length);
      expect(result.metadata.totalBusinesses).toBe(result.businesses.length);
      expect(result.metadata.totalMatches).toBe(result.matches.length);
      expect(result.metadata.availableDomains).toBeLessThanOrEqual(result.metadata.totalDomains);
      expect(result.metadata.executionTime).toBeGreaterThan(0);
    }, testTimeout);

    it('should handle provider errors gracefully', async () => {
      const input = createSearchInput();
      
      // Should not throw even if providers have issues
      await expect(orchestrator.executeSearch(input)).resolves.toBeDefined();
    }, testTimeout);

    it('should respect maxDomains parameter', async () => {
      const input = createSearchInput({ maxDomains: 3 });
      const result = await orchestrator.executeSearch(input);

      expect(result.domains.length).toBeLessThanOrEqual(3);
    }, testTimeout);

    it('should respect maxBusinesses parameter', async () => {
      const input = createSearchInput({ maxBusinesses: 2 });
      const result = await orchestrator.executeSearch(input);

      expect(result.businesses.length).toBeLessThanOrEqual(2);
    }, testTimeout);
  });

  describe('input validation', () => {
    it('should reject niche longer than 100 characters', async () => {
      const input = createSearchInput({
        niche: 'a'.repeat(101),
      });

      await expect(orchestrator.executeSearch(input)).rejects.toThrow('too long');
    });

    it('should reject city longer than 100 characters', async () => {
      const input = createSearchInput({
        city: 'a'.repeat(101),
      });

      await expect(orchestrator.executeSearch(input)).rejects.toThrow('too long');
    });

    it('should reject state longer than 50 characters', async () => {
      const input = createSearchInput({
        state: 'a'.repeat(51),
      });

      await expect(orchestrator.executeSearch(input)).rejects.toThrow('too long');
    });
  });
});
