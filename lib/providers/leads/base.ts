import { LeadProvider, LeadSearchParams, BusinessLeadSeed, BusinessLeadDetails } from '../types';

/**
 * Abstract base class for lead providers
 * Provides common functionality and enforces interface compliance
 */
export abstract class BaseLeadProvider implements LeadProvider {
  abstract name: string;

  /**
   * Search for businesses matching the given parameters
   */
  abstract searchBusinesses(params: LeadSearchParams): Promise<BusinessLeadSeed[]>;

  /**
   * Get detailed information for a specific business
   */
  abstract getBusinessDetails(placeId: string): Promise<BusinessLeadDetails | null>;

  /**
   * Normalize phone number to a consistent format
   */
  protected normalizePhone(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    // Return original if not a standard US number
    return phone;
  }

  /**
   * Extract domain from website URL
   */
  protected extractDomain(url: string): string {
    try {
      const normalized = url.toLowerCase().trim();
      const withProtocol = normalized.startsWith('http') ? normalized : `https://${normalized}`;
      const urlObj = new URL(withProtocol);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
  }

  /**
   * Delay execution (for rate limiting)
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
