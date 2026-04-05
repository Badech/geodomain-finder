import { BaseEmailExtractor } from './base';
import { PublicEmailResult, ProviderError } from '../types';

/**
 * Website scraper for extracting public emails
 * Scans homepage and common pages (contact, about) for email addresses
 * 
 * IMPORTANT: Only extracts publicly visible emails. Never fabricates or guesses emails.
 */
export class WebsiteScraperEmailExtractor extends BaseEmailExtractor {
  name = 'website-scraper';
  private timeout = 10000; // 10 second timeout
  private maxPagesToScan = 3; // Homepage + contact + about

  async extractPublicEmails(websiteUrl: string): Promise<PublicEmailResult> {
    const normalizedUrl = this.normalizeUrl(websiteUrl);
    const websiteDomain = this.extractDomain(normalizedUrl);

    try {
      // Scan multiple pages for emails
      const pagesToScan = [
        { url: normalizedUrl, label: 'homepage' },
        { url: this.buildUrl(normalizedUrl, '/contact'), label: 'contact' },
        { url: this.buildUrl(normalizedUrl, '/contact-us'), label: 'contact' },
        { url: this.buildUrl(normalizedUrl, '/about'), label: 'about' },
        { url: this.buildUrl(normalizedUrl, '/about-us'), label: 'about' },
      ];

      for (const page of pagesToScan) {
        const result = await this.scanPageForEmail(page.url, page.label, websiteDomain);
        
        // If we found a valid email, return it
        if (result.email) {
          return result;
        }

        // Small delay between requests to be respectful
        await this.delay(200);
      }

      // No email found
      return {
        email: null,
        source: null,
        confidence: null,
        foundAt: new Date(),
      };
    } catch (error) {
      // Return null result on error (don't throw - email extraction is optional)
      return {
        email: null,
        source: null,
        confidence: null,
        foundAt: new Date(),
      };
    }
  }

  private async scanPageForEmail(
    url: string,
    pageType: string,
    websiteDomain: string
  ): Promise<PublicEmailResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'GeoDomainScout/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          email: null,
          source: null,
          confidence: null,
          foundAt: new Date(),
        };
      }

      const html = await response.text();
      
      // First, look for mailto: links (highest confidence)
      const mailtoEmail = this.extractEmailFromMailto(html);
      if (mailtoEmail && this.isValidEmail(mailtoEmail) && !this.isGenericEmail(mailtoEmail)) {
        return {
          email: mailtoEmail,
          source: url,
          confidence: this.calculateConfidence(mailtoEmail, url, websiteDomain),
          foundAt: new Date(),
        };
      }

      // Second, extract all emails from page content
      const emails = this.extractEmailsFromText(html);
      
      // Filter and score emails
      const validEmails = emails
        .filter(email => this.isValidEmail(email))
        .map(email => ({
          email,
          confidence: this.calculateConfidence(email, url, websiteDomain),
          isGeneric: this.isGenericEmail(email),
        }))
        .filter(item => !item.isGeneric)
        .sort((a, b) => {
          // Prefer high confidence emails
          const confidenceScore = { high: 3, medium: 2, low: 1 };
          return confidenceScore[b.confidence] - confidenceScore[a.confidence];
        });

      if (validEmails.length > 0) {
        const best = validEmails[0];
        return {
          email: best.email,
          source: url,
          confidence: best.confidence,
          foundAt: new Date(),
        };
      }

      return {
        email: null,
        source: null,
        confidence: null,
        foundAt: new Date(),
      };
    } catch (error) {
      // Ignore errors and return null result
      return {
        email: null,
        source: null,
        confidence: null,
        foundAt: new Date(),
      };
    }
  }

  private buildUrl(baseUrl: string, path: string): string {
    try {
      const url = new URL(baseUrl);
      url.pathname = path;
      return url.toString();
    } catch {
      return baseUrl + path;
    }
  }
}
