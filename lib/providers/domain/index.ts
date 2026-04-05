import { DomainProvider } from '../types';
import { MockDomainProvider } from './mock';
import { DynadotDomainProvider } from './dynadot';

/**
 * Factory function to create a domain provider based on configuration
 */
export function createDomainProvider(
  provider: 'dynadot' | 'mock',
  apiKey?: string
): DomainProvider {
  switch (provider) {
    case 'dynadot':
      if (!apiKey) {
        throw new Error('Dynadot API key is required for production mode');
      }
      return new DynadotDomainProvider(apiKey);
    
    case 'mock':
      return new MockDomainProvider();
    
    default:
      throw new Error(`Unknown domain provider: ${provider}`);
  }
}

export { MockDomainProvider } from './mock';
export { DynadotDomainProvider } from './dynadot';
export { BaseDomainProvider } from './base';
