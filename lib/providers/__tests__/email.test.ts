import { describe, it, expect, beforeEach } from 'vitest';
import { MockEmailExtractor } from '../email/mock';
import { BaseEmailExtractor } from '../email/base';
import { createEmailExtractor } from '../email';

describe('Email Extractors', () => {
  describe('MockEmailExtractor', () => {
    let extractor: MockEmailExtractor;

    beforeEach(() => {
      extractor = new MockEmailExtractor();
    });

    it('should have correct name', () => {
      expect(extractor.name).toBe('mock');
    });

    it('should extract email from website', async () => {
      const result = await extractor.extractPublicEmails('https://example.com');

      expect(result).toBeDefined();
      expect(result.foundAt).toBeInstanceOf(Date);
      
      // Result can be null (no email found) or an email
      if (result.email) {
        expect(result.email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
        expect(result.source).toBeTruthy();
        expect(result.confidence).toMatch(/^(high|medium|low)$/);
      } else {
        expect(result.email).toBeNull();
        expect(result.source).toBeNull();
        expect(result.confidence).toBeNull();
      }
    });

    it('should handle various domain formats', async () => {
      const domains = [
        'https://example.com',
        'http://example.com',
        'example.com',
        'www.example.com',
      ];

      for (const domain of domains) {
        const result = await extractor.extractPublicEmails(domain);
        expect(result).toBeDefined();
        expect(result.foundAt).toBeInstanceOf(Date);
      }
    });
  });

  describe('BaseEmailExtractor', () => {
    class TestExtractor extends BaseEmailExtractor {
      name = 'test';
      
      async extractPublicEmails() {
        return {
          email: null,
          source: null,
          confidence: null,
          foundAt: new Date(),
        };
      }
    }

    let extractor: TestExtractor;

    beforeEach(() => {
      extractor = new TestExtractor();
    });

    it('should normalize URLs', () => {
      const testCases = [
        { input: 'example.com', expected: 'https://example.com' },
        { input: 'http://example.com', expected: 'http://example.com' },
        { input: 'https://example.com', expected: 'https://example.com' },
        { input: '  EXAMPLE.COM  ', expected: 'https://example.com' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = (extractor as any).normalizeUrl(input);
        expect(result).toBe(expected);
      });
    });

    it('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
      ];

      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user @example.com',
      ];

      validEmails.forEach(email => {
        expect((extractor as any).isValidEmail(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect((extractor as any).isValidEmail(email)).toBe(false);
      });
    });

    it('should detect generic emails', () => {
      const genericEmails = [
        'noreply@example.com',
        'info@example.com',
        'support@gmail.com',
        'admin@yahoo.com',
      ];

      const nonGenericEmails = [
        'john.doe@example.com',
        'business@customdomain.com',
      ];

      genericEmails.forEach(email => {
        expect((extractor as any).isGenericEmail(email)).toBe(true);
      });

      nonGenericEmails.forEach(email => {
        expect((extractor as any).isGenericEmail(email)).toBe(false);
      });
    });

    it('should extract email from mailto link', () => {
      const testCases = [
        { input: 'mailto:test@example.com', expected: 'test@example.com' },
        { input: '<a href="mailto:contact@example.com">Email</a>', expected: 'contact@example.com' },
        { input: 'no email here', expected: null },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = (extractor as any).extractEmailFromMailto(input);
        expect(result).toBe(expected);
      });
    });

    it('should extract emails from text', () => {
      const text = 'Contact us at info@example.com or support@example.com for help.';
      const emails = (extractor as any).extractEmailsFromText(text);

      expect(emails).toContain('info@example.com');
      expect(emails).toContain('support@example.com');
      expect(emails).toHaveLength(2);
    });

    it('should calculate confidence correctly', () => {
      const websiteDomain = 'example.com';

      // High confidence: matching domain
      expect((extractor as any).calculateConfidence('info@example.com', 'https://example.com/contact', websiteDomain))
        .toBe('high');

      // Medium confidence: contact page
      expect((extractor as any).calculateConfidence('info@other.com', 'https://example.com/contact', websiteDomain))
        .toBe('medium');

      // Low confidence: other
      expect((extractor as any).calculateConfidence('info@other.com', 'https://example.com', websiteDomain))
        .toBe('low');
    });

    it('should extract domain from URL', () => {
      const testCases = [
        { input: 'https://www.example.com/page', expected: 'example.com' },
        { input: 'http://example.com', expected: 'example.com' },
        { input: 'https://sub.example.com', expected: 'sub.example.com' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = (extractor as any).extractDomain(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('createEmailExtractor factory', () => {
    it('should create mock extractor', () => {
      const extractor = createEmailExtractor('mock');
      expect(extractor.name).toBe('mock');
    });

    it('should create website-scraper extractor', () => {
      const extractor = createEmailExtractor('website-scraper');
      expect(extractor.name).toBe('website-scraper');
    });

    it('should throw error for unknown extractor', () => {
      expect(() => createEmailExtractor('unknown' as any)).toThrow('Unknown email extractor provider');
    });
  });
});
