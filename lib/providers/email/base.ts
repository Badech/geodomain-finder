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
   * Classify email type for better categorization
   * Returns classification instead of just true/false
   */
  protected classifyEmail(email: string): 'role-based' | 'personal' | 'free-provider' | 'undeliverable' {
    const lowerEmail = email.toLowerCase();
    const prefix = lowerEmail.split('@')[0];
    const domain = lowerEmail.split('@')[1] || '';

    // Undeliverable emails (should never be used)
    const undeliverablePrefixes = [
      'noreply', 'no-reply', 'donotreply', 'do-not-reply',
      'mailer-daemon', 'postmaster', 'webmaster',
    ];
    
    if (undeliverablePrefixes.some(bad => prefix.includes(bad))) {
      return 'undeliverable';
    }

    // Role-based emails (valid for business contact)
    const rolePrefixes = [
      'info', 'contact', 'sales', 'support', 'help',
      'admin', 'office', 'hello', 'hi', 'team',
      'service', 'customers', 'business', 'inquiries',
    ];
    
    if (rolePrefixes.includes(prefix)) {
      return 'role-based';
    }

    // Free email providers (less preferred but still valid)
    const freeProviders = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'aol.com', 'icloud.com', 'mail.com', 'live.com',
      'googlemail.com', 'ymail.com',
    ];
    
    if (freeProviders.includes(domain)) {
      return 'free-provider';
    }

    // Personal/named email (best for B2B outreach)
    return 'personal';
  }

  /**
   * Determine if email should be kept for outreach
   */
  protected shouldKeepEmail(email: string): boolean {
    const classification = this.classifyEmail(email);
    // Only filter out truly undeliverable emails
    return classification !== 'undeliverable';
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
