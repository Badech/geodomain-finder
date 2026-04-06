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
    await this.delay(300 + Math.random() * 300);

    const normalizedUrl = this.normalizeUrl(websiteUrl);
    const domain = this.extractDomain(normalizedUrl);

    console.log(`[MockEmail] Extracting email from: ${websiteUrl}`);

    // Simulate realistic scenarios with BETTER success rate:
    // 40% - email found with high confidence
    // 35% - email found with medium confidence
    // 15% - email found with low confidence
    // 10% - no email found

    const random = Math.random();

    if (random < 0.4) {
      // High confidence - domain-matched email
      const email = `info@${domain}`;
      console.log(`[MockEmail] Found: ${email} (high confidence)`);
      return {
        email,
        source: `${normalizedUrl}/contact`,
        confidence: 'high',
        foundAt: new Date(),
        classification: 'role-based',
        sourceType: 'contact-page',
      };
    } else if (random < 0.75) {
      // Medium confidence - contact email
      const email = `contact@${domain}`;
      console.log(`[MockEmail] Found: ${email} (medium confidence)`);
      return {
        email,
        source: `${normalizedUrl}/about`,
        confidence: 'medium',
        foundAt: new Date(),
        classification: 'role-based',
        sourceType: 'about-page',
      };
    } else if (random < 0.9) {
      // Low confidence - generic email
      const email = `hello@${domain}`;
      console.log(`[MockEmail] Found: ${email} (low confidence)`);
      return {
        email,
        source: normalizedUrl,
        confidence: 'low',
        foundAt: new Date(),
        classification: 'role-based',
        sourceType: 'homepage',
      };
    } else {
      // No email found
      console.log(`[MockEmail] No email found`);
      return {
        email: null,
        source: null,
        confidence: null,
        foundAt: new Date(),
      };
    }
  }
}
