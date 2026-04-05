import { describe, it, expect, beforeEach } from 'vitest';
import { MockLeadProvider } from '../leads/mock';
import { BaseLeadProvider } from '../leads/base';
import { createLeadProvider } from '../leads';

describe('Lead Providers', () => {
  describe('MockLeadProvider', () => {
    let provider: MockLeadProvider;

    beforeEach(() => {
      provider = new MockLeadProvider();
    });

    it('should have correct name', () => {
      expect(provider.name).toBe('mock');
    });

    it('should search for businesses', async () => {
      const results = await provider.searchBusinesses({
        niche: 'car detailing',
        city: 'Richmond',
        state: 'Virginia',
        maxResults: 10,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(10);

      results.forEach(business => {
        expect(business.placeId).toContain('mock_place');
        expect(business.name).toBeTruthy();
        expect(business.address).toContain('Richmond');
        expect(business.city).toBe('Richmond');
        expect(business.state).toBe('Virginia');
        expect(business.phone).toMatch(/^\(\d{3}\) \d{3}-\d{4}$/);
        
        if (business.rating) {
          expect(business.rating).toBeGreaterThanOrEqual(0);
          expect(business.rating).toBeLessThanOrEqual(5);
        }
      });
    });

    it('should get business details', async () => {
      const placeId = 'mock_place_Tampa_roofing_5';
      const details = await provider.getBusinessDetails(placeId);

      expect(details).not.toBeNull();
      expect(details!.placeId).toBe(placeId);
      expect(details!.name).toBeTruthy();
      expect(details!.address).toBeTruthy();
      expect(details!.businessHours).toBeDefined();
      expect(details!.businessHours?.Monday).toBeTruthy();
    });

    it('should return null for invalid placeId', async () => {
      const details = await provider.getBusinessDetails('invalid-place-id');
      expect(details).toBeNull();
    });

    it('should respect maxResults parameter', async () => {
      const results = await provider.searchBusinesses({
        niche: 'hvac',
        city: 'Phoenix',
        state: 'Arizona',
        maxResults: 5,
      });

      expect(results.length).toBeLessThanOrEqual(5);
    });
  });

  describe('BaseLeadProvider', () => {
    class TestProvider extends BaseLeadProvider {
      name = 'test';
      
      async searchBusinesses() {
        return [];
      }
      
      async getBusinessDetails() {
        return null;
      }
    }

    let provider: TestProvider;

    beforeEach(() => {
      provider = new TestProvider();
    });

    it('should normalize phone numbers', () => {
      const testCases = [
        { input: '1234567890', expected: '(123) 456-7890' },
        { input: '(123) 456-7890', expected: '(123) 456-7890' },
        { input: '123-456-7890', expected: '(123) 456-7890' },
        { input: '123.456.7890', expected: '(123) 456-7890' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = (provider as any).normalizePhone(input);
        expect(result).toBe(expected);
      });
    });

    it('should extract domain from URL', () => {
      const testCases = [
        { input: 'https://www.example.com', expected: 'example.com' },
        { input: 'http://example.com/path', expected: 'example.com' },
        { input: 'example.com', expected: 'example.com' },
        { input: 'www.example.com', expected: 'example.com' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = (provider as any).extractDomain(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('createLeadProvider factory', () => {
    it('should create mock provider', () => {
      const provider = createLeadProvider('mock');
      expect(provider.name).toBe('mock');
    });

    it('should throw error for google-places without API key', () => {
      expect(() => createLeadProvider('google-places')).toThrow('API key is required');
    });

    it('should create google-places provider with API key', () => {
      const provider = createLeadProvider('google-places', 'test-api-key');
      expect(provider.name).toBe('google-places');
    });

    it('should throw error for unknown provider', () => {
      expect(() => createLeadProvider('unknown' as any)).toThrow('Unknown lead provider');
    });
  });
});
