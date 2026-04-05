import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the database before importing
vi.mock('../../../lib/db', () => ({
  db: {
    searchQuery: {
      create: vi.fn().mockResolvedValue({ id: 'mock-search-id' }),
    },
    domainOpportunity: {
      upsert: vi.fn().mockResolvedValue({ id: 'mock-domain-id', domain: 'test.com' }),
    },
    businessLead: {
      upsert: vi.fn().mockResolvedValue({ id: 'mock-business-id', placeId: 'mock-place-id' }),
    },
    opportunityMatch: {
      upsert: vi.fn().mockResolvedValue({ id: 'mock-match-id' }),
    },
  },
}));

import { POST } from '../search/route';

describe('Search API', () => {
  beforeEach(() => {
    // Set demo mode for tests
    process.env.DEMO_MODE = 'true';
  });

  describe('POST /api/search', () => {
    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.code).toBe('VALIDATION_ERROR');
    });

    it('should validate niche field', async () => {
      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        body: JSON.stringify({
          niche: '',
          city: 'Richmond',
          state: 'Virginia',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should execute search with valid input', async () => {
      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        body: JSON.stringify({
          niche: 'car detailing',
          city: 'Richmond',
          state: 'Virginia',
          maxDomains: 5,
          maxBusinesses: 3,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('searchQueryId');
      expect(data.data).toHaveProperty('domains');
      expect(data.data).toHaveProperty('businesses');
      expect(data.data).toHaveProperty('matches');
      expect(data.data).toHaveProperty('metadata');
      
      expect(Array.isArray(data.data.domains)).toBe(true);
      expect(Array.isArray(data.data.businesses)).toBe(true);
      expect(Array.isArray(data.data.matches)).toBe(true);
    }, 20000); // Increase timeout for full search

    it('should respect maxDomains parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        body: JSON.stringify({
          niche: 'roofing',
          city: 'Tampa',
          state: 'Florida',
          maxDomains: 3,
          maxBusinesses: 2,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.domains.length).toBeLessThanOrEqual(3);
    }, 20000);

    it('should include metadata in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        body: JSON.stringify({
          niche: 'hvac',
          city: 'Phoenix',
          state: 'Arizona',
          maxDomains: 5,
          maxBusinesses: 3,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.metadata).toHaveProperty('totalDomains');
      expect(data.data.metadata).toHaveProperty('availableDomains');
      expect(data.data.metadata).toHaveProperty('totalBusinesses');
      expect(data.data.metadata).toHaveProperty('totalMatches');
      expect(data.data.metadata).toHaveProperty('executionTime');
      expect(data.data.metadata).toHaveProperty('persistedAt');
    }, 20000);
  });
});
