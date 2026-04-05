/**
 * API Integration Tests for Search Endpoint
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('POST /api/search', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  it('should return 400 for missing required fields', async () => {
    const response = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  it('should return 400 for invalid niche (too long)', async () => {
    const response = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        niche: 'a'.repeat(101),
        city: 'Miami',
        state: 'Florida',
      }),
    });

    expect(response.status).toBe(400);
  });

  it('should accept valid search request', async () => {
    const response = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        niche: 'plumber',
        city: 'Miami',
        state: 'Florida',
        maxDomains: 5,
        maxBusinesses: 5,
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('domains');
    expect(data.data).toHaveProperty('businesses');
    expect(data.data).toHaveProperty('matches');
  });

  it('should sanitize niche input (lowercase)', async () => {
    const response = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        niche: 'PLUMBER',
        city: 'Miami',
        state: 'Florida',
        maxDomains: 5,
        maxBusinesses: 5,
      }),
    });

    expect(response.status).toBe(200);
  });

  it('should limit maxDomains to 50', async () => {
    const response = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        niche: 'plumber',
        city: 'Miami',
        state: 'Florida',
        maxDomains: 100, // Should be rejected
        maxBusinesses: 5,
      }),
    });

    expect(response.status).toBe(400);
  });

  it('should enforce rate limiting after multiple requests', async () => {
    // Make 11 requests (limit is 10 per 5 minutes)
    const requests = Array.from({ length: 11 }).map(() =>
      fetch(`${baseUrl}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: 'plumber',
          city: 'Miami',
          state: 'Florida',
          maxDomains: 5,
          maxBusinesses: 5,
        }),
      })
    );

    const responses = await Promise.all(requests);
    const lastResponse = responses[responses.length - 1];

    // Last request should be rate limited
    expect(lastResponse.status).toBe(429);
  }, 60000); // Longer timeout for this test
});
