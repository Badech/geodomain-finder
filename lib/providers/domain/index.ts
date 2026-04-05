import { DomainProvider } from '../types';
import { MockDomainProvider } from './mock';
import { DynadotDomainProvider } from './dynadot';
import { CachedDomainProvider } from './cached-provider';

/**
 * Factory function to create a domain provider based on configuration
 * Automatically wraps provider with caching for better performance
 */
export function createDomainProvider(
  provider: 'dynadot' | 'mock',
  apiKey?: string,
  enableCache: boolean = true
): DomainProvider {
  let baseProvider: DomainProvider;
  
  switch (provider) {
    case 'dynadot':
      if (!apiKey) {
        throw new Error('Dynadot API key is required for production mode');
      }
      baseProvider = new DynadotDomainProvider(apiKey);
      break;
    
    case 'mock':
      baseProvider = new MockDomainProvider();
      break;
    
    default:
      throw new Error(`Unknown domain provider: ${provider}`);
  }

  // Wrap with cache if enabled
  if (enableCache) {
    return new CachedDomainProvider(baseProvider);
  }

  return baseProvider;
}

export { MockDomainProvider } from './mock';
export { DynadotDomainProvider } from './dynadot';
export { BaseDomainProvider } from './base';
export { CachedDomainProvider } from './cached-provider';
