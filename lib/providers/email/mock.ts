import { BaseEmailExtractor } from './base';
import { PublicEmailResult } from '../types';

/**
 * Mock email extractor for demo mode
 * Simulates email extraction without making real HTTP requests
 */
export class MockEmailExtractor extends BaseEmailExtractor {
  name = 'mock';

  async extractPublicEmails(websiteUrl: string): Promise<PublicEmailResult> {
    // Simulate network delay
    await this.delay(500 + Math.random() * 500);

    const normalizedUrl = this.normalizeUrl(websiteUrl);
    const domain = this.extractDomain(normalizedUrl);

    // Simulate realistic scenarios:
    // 30% - email found with high confidence
    // 30% - email found with medium confidence
    // 20% - email found with low confidence
    // 20% - no email found

    const random = Math.random();

    if (random < 0.3) {
      // High confidence - domain-matched email
      return {
        email: `info@${domain}`,
        source: `${normalizedUrl}/contact`,
        confidence: 'high',
        foundAt: new Date(),
      };
    } else if (random < 0.6) {
      // Medium confidence - found on contact page but different domain
      return {
        email: `contact@${domain.replace(/\..+$/, '')}.net`,
        source: `${normalizedUrl}/about`,
        confidence: 'medium',
        foundAt: new Date(),
      };
    } else if (random < 0.8) {
      // Low confidence - generic email
      return {
        email: `admin@${domain}`,
        source: normalizedUrl,
        confidence: 'low',
        foundAt: new Date(),
      };
    } else {
      // No email found
      return {
        email: null,
        source: null,
        confidence: null,
        foundAt: new Date(),
      };
    }
  }
}
