import { ProviderConfig } from './types';
import { createDomainProvider } from './domain';
import { createLeadProvider } from './leads';
import { createEmailExtractor } from './email';

/**
 * Get provider configuration from environment variables
 */
export function getProviderConfig(): ProviderConfig {
  const demoMode = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';
  
  return {
    domain: {
      provider: demoMode ? 'mock' : 'dynadot',
      apiKey: process.env.DYNADOT_ACCOUNT_API_KEY,
    },
    leads: {
      provider: demoMode ? 'mock' : 'google-places',
      apiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
    email: {
      provider: demoMode ? 'mock' : 'website-scraper',
    },
    demoMode,
  };
}

/**
 * Initialize all providers based on configuration
 */
export function initializeProviders(config?: ProviderConfig) {
  const providerConfig = config || getProviderConfig();

  return {
    domainProvider: createDomainProvider(
      providerConfig.domain.provider,
      providerConfig.domain.apiKey
    ),
    leadProvider: createLeadProvider(
      providerConfig.leads.provider,
      providerConfig.leads.apiKey
    ),
    emailExtractor: createEmailExtractor(
      providerConfig.email.provider
    ),
  };
}

/**
 * Provider health check results
 */
export interface ProviderHealthCheck {
  provider: string;
  healthy: boolean;
  message: string;
  checkedAt: Date;
}

/**
 * Check health of all providers
 */
export async function checkProvidersHealth(config?: ProviderConfig): Promise<ProviderHealthCheck[]> {
  const providerConfig = config || getProviderConfig();
  const results: ProviderHealthCheck[] = [];
  
  // Check domain provider
  try {
    const domainProvider = createDomainProvider(
      providerConfig.domain.provider,
      providerConfig.domain.apiKey
    );
    
    // Try a simple test domain check
    const testResult = await domainProvider.checkSingleDomain('test-health-check-12345.com');
    
    results.push({
      provider: `domain (${domainProvider.name})`,
      healthy: true,
      message: 'Provider is responding correctly',
      checkedAt: new Date(),
    });
  } catch (error) {
    results.push({
      provider: `domain (${providerConfig.domain.provider})`,
      healthy: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      checkedAt: new Date(),
    });
  }

  // Check lead provider
  try {
    const leadProvider = createLeadProvider(
      providerConfig.leads.provider,
      providerConfig.leads.apiKey
    );
    
    // Try a simple test search (mock provider will always work)
    if (providerConfig.leads.provider === 'mock') {
      results.push({
        provider: `leads (${leadProvider.name})`,
        healthy: true,
        message: 'Mock provider is ready',
        checkedAt: new Date(),
      });
    } else {
      // For real provider, just check if API key is present
      if (providerConfig.leads.apiKey) {
        results.push({
          provider: `leads (${leadProvider.name})`,
          healthy: true,
          message: 'API key is configured',
          checkedAt: new Date(),
        });
      } else {
        results.push({
          provider: `leads (${leadProvider.name})`,
          healthy: false,
          message: 'API key is missing',
          checkedAt: new Date(),
        });
      }
    }
  } catch (error) {
    results.push({
      provider: `leads (${providerConfig.leads.provider})`,
      healthy: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      checkedAt: new Date(),
    });
  }

  // Check email extractor
  try {
    const emailExtractor = createEmailExtractor(providerConfig.email.provider);
    
    results.push({
      provider: `email (${emailExtractor.name})`,
      healthy: true,
      message: 'Extractor is ready',
      checkedAt: new Date(),
    });
  } catch (error) {
    results.push({
      provider: `email (${providerConfig.email.provider})`,
      healthy: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      checkedAt: new Date(),
    });
  }

  return results;
}

/**
 * Fallback mechanism for provider failures
 */
export class ProviderFallbackManager {
  private failureCounts: Map<string, number> = new Map();
  private maxFailures = 3;
  private fallbackDelay = 60000; // 1 minute

  /**
   * Record a provider failure
   */
  recordFailure(providerName: string): void {
    const current = this.failureCounts.get(providerName) || 0;
    this.failureCounts.set(providerName, current + 1);
  }

  /**
   * Check if provider should be bypassed due to failures
   */
  shouldFallback(providerName: string): boolean {
    const failures = this.failureCounts.get(providerName) || 0;
    return failures >= this.maxFailures;
  }

  /**
   * Reset failure count for a provider
   */
  reset(providerName: string): void {
    this.failureCounts.set(providerName, 0);
  }

  /**
   * Get current failure count
   */
  getFailureCount(providerName: string): number {
    return this.failureCounts.get(providerName) || 0;
  }
}

// Singleton instance for the application
export const fallbackManager = new ProviderFallbackManager();
