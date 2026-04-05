import { describe, it, expect, beforeEach } from 'vitest';
import { MockDomainProvider } from '../domain/mock';
import { BaseDomainProvider } from '../domain/base';
import { createDomainProvider } from '../domain';

describe('Domain Providers', () => {
  describe('MockDomainProvider', () => {
    let provider: MockDomainProvider;

    beforeEach(() => {
      provider = new MockDomainProvider();
    });

    it('should have correct name', () => {
      expect(provider.name).toBe('mock');
    });

    it('should check domain availability', async () => {
      const domains = ['test-domain.com', 'example-business.com'];
      const results = await provider.checkAvailability(domains);

      expect(results).toHaveLength(2);
      results.forEach((result, index) => {
        expect(result.domain).toBe(domains[index]);
        expect(result.status).toMatch(/^(available|taken)$/);
        expect(result.available).toBe(result.status === 'available');
        expect(result.checkedAt).toBeInstanceOf(Date);
        expect(result.provider).toBe('mock');
      });
    });

    it('should check single domain availability', async () => {
      const result = await provider.checkSingleDomain('single-test.com');

      expect(result.domain).toBe('single-test.com');
      expect(result.status).toMatch(/^(available|taken)$/);
      expect(result.checkedAt).toBeInstanceOf(Date);
    });

    it('should normalize domain names', async () => {
      const result = await provider.checkSingleDomain('UPPER-CASE.COM');

      expect(result.domain).toBe('upper-case.com');
    });

    it('should handle multiple domains', async () => {
      const domains = Array.from({ length: 10 }, (_, i) => `test${i}.com`);
      const results = await provider.checkAvailability(domains);

      expect(results).toHaveLength(10);
    });
  });

  describe('BaseDomainProvider', () => {
    class TestProvider extends BaseDomainProvider {
      name = 'test';
      
      async checkAvailability(domains: string[]) {
        return domains.map(domain => ({
          domain: this.normalizeDomain(domain),
          available: true,
          status: 'available' as const,
          checkedAt: new Date(),
          provider: this.name,
        }));
      }
    }

    let provider: TestProvider;

    beforeEach(() => {
      provider = new TestProvider();
    });

    it('should normalize domain correctly', async () => {
      const testCases = [
        { input: 'https://example.com', expected: 'example.com' },
        { input: 'http://www.example.com/', expected: 'example.com' },
        { input: 'EXAMPLE.COM', expected: 'example.com' },
        { input: '  example.com  ', expected: 'example.com' },
      ];

      for (const { input, expected } of testCases) {
        const result = await provider.checkSingleDomain(input);
        expect(result.domain).toBe(expected);
      }
    });

    it('should validate domain format', () => {
      const validDomains = [
        'example.com',
        'sub.example.com',
        'my-domain.co.uk',
        'test123.com',
      ];

      const invalidDomains = [
        'not a domain',
        'example',
        '-invalid.com',
        'invalid-.com',
      ];

      validDomains.forEach(domain => {
        expect((provider as any).isValidDomain(domain)).toBe(true);
      });

      invalidDomains.forEach(domain => {
        expect((provider as any).isValidDomain(domain)).toBe(false);
      });
    });

    it('should chunk domains correctly', () => {
      const domains = Array.from({ length: 25 }, (_, i) => `test${i}.com`);
      const chunks = (provider as any).chunkDomains(domains, 10);

      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toHaveLength(10);
      expect(chunks[1]).toHaveLength(10);
      expect(chunks[2]).toHaveLength(5);
    });
  });

  describe('createDomainProvider factory', () => {
    it('should create mock provider', () => {
      const provider = createDomainProvider('mock');
      expect(provider.name).toBe('mock');
    });

    it('should throw error for dynadot without API key', () => {
      expect(() => createDomainProvider('dynadot')).toThrow('API key is required');
    });

    it('should create dynadot provider with API key', () => {
      const provider = createDomainProvider('dynadot', 'test-api-key');
      expect(provider.name).toBe('dynadot');
    });

    it('should throw error for unknown provider', () => {
      expect(() => createDomainProvider('unknown' as any)).toThrow('Unknown domain provider');
    });
  });
});
