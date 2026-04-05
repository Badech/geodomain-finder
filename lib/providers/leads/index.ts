import { LeadProvider } from '../types';
import { MockLeadProvider } from './mock';
import { GooglePlacesProvider } from './google-places';

/**
 * Factory function to create a lead provider based on configuration
 */
export function createLeadProvider(
  provider: 'google-places' | 'mock',
  apiKey?: string
): LeadProvider {
  switch (provider) {
    case 'google-places':
      if (!apiKey) {
        throw new Error('Google Places API key is required for production mode');
      }
      return new GooglePlacesProvider(apiKey);
    
    case 'mock':
      return new MockLeadProvider();
    
    default:
      throw new Error(`Unknown lead provider: ${provider}`);
  }
}

export { MockLeadProvider } from './mock';
export { GooglePlacesProvider } from './google-places';
export { BaseLeadProvider } from './base';
