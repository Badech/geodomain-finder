import { EmailExtractorProvider, PublicEmailResult } from '../types';

/**
 * Abstract base class for email extractor providers
 * Provides common functionality and enforces interface compliance
 */
export abstract class BaseEmailExtractor implements EmailExtractorProvider {
  abstract name: string;

  /**
   * Extract public emails from a website
   */
  abstract extractPublicEmails(websiteUrl: string): Promise<PublicEmailResult>;

  /**
   * Normalize URL to include protocol
   */
  protected normalizeUrl(url: string): string {
    const normalized = url.trim().toLowerCase();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      return `https://${normalized}`;
    }
    return normalized;
  }

  /**
   * Validate email format
   */
  protected isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Extract domain from URL
   */
  protected extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }

  /**
   * Check if email is likely a generic/spam email
   */
  protected isGenericEmail(email: string): boolean {
    const genericPrefixes = [
      'noreply', 'no-reply', 'donotreply', 'do-not-reply',
      'info', 'admin', 'webmaster', 'postmaster',
      'support', 'help', 'contact', 'sales',
      'marketing', 'hello', 'hi',
    ];

    const lowerEmail = email.toLowerCase();
    
    // Check for generic prefixes
    const prefix = lowerEmail.split('@')[0];
    if (genericPrefixes.includes(prefix)) {
      return true;
    }

    // Check for free email providers (these are less valuable for B2B)
    const freeProviders = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'aol.com', 'icloud.com', 'mail.com',
    ];
    
    const domain = lowerEmail.split('@')[1];
    return freeProviders.includes(domain);
  }

  /**
   * Calculate confidence score for an email
   */
  protected calculateConfidence(
    email: string,
    source: string,
    websiteDomain: string
  ): 'high' | 'medium' | 'low' {
    const emailDomain = email.split('@')[1];
    
    // High confidence: email domain matches website domain
    if (emailDomain === websiteDomain) {
      return 'high';
    }

    // Medium confidence: found in contact page or mailto link
    if (source.includes('contact') || source.includes('about') || source.includes('mailto')) {
      return 'medium';
    }

    // Low confidence: everything else
    return 'low';
  }

  /**
   * Extract email from mailto: link
   */
  protected extractEmailFromMailto(text: string): string | null {
    const mailtoRegex = /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = text.match(mailtoRegex);
    return match ? match[1] : null;
  }

  /**
   * Extract all emails from text content
   */
  protected extractEmailsFromText(text: string): string[] {
    const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi;
    const matches = text.match(emailRegex) || [];
    return [...new Set(matches)]; // Remove duplicates
  }

  /**
   * Delay execution (for rate limiting)
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
