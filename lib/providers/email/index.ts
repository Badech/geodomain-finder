import { EmailExtractorProvider } from '../types';
import { MockEmailExtractor } from './mock';
import { WebsiteScraperEmailExtractor } from './website-scraper';

/**
 * Factory function to create an email extractor provider based on configuration
 */
export function createEmailExtractor(
  provider: 'website-scraper' | 'mock'
): EmailExtractorProvider {
  switch (provider) {
    case 'website-scraper':
      return new WebsiteScraperEmailExtractor();
    
    case 'mock':
      return new MockEmailExtractor();
    
    default:
      throw new Error(`Unknown email extractor provider: ${provider}`);
  }
}

export { MockEmailExtractor } from './mock';
export { WebsiteScraperEmailExtractor } from './website-scraper';
export { BaseEmailExtractor } from './base';
