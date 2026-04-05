import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getProviderConfig, initializeProviders, checkProvidersHealth, ProviderFallbackManager } from '../config';

describe('Provider Configuration', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.DEMO_MODE;
    delete process.env.NODE_ENV;
    delete process.env.DYNADOT_ACCOUNT_API_KEY;
    delete process.env.GOOGLE_MAPS_API_KEY;
  });

  describe('getProviderConfig', () => {
    it('should use mock providers in demo mode', () => {
      process.env.DEMO_MODE = 'true';
      const config = getProviderConfig();

      expect(config.demoMode).toBe(true);
      expect(config.domain.provider).toBe('mock');
      expect(config.leads.provider).toBe('mock');
      expect(config.email.provider).toBe('mock');
    });

    it('should use mock providers in development', () => {
      process.env.NODE_ENV = 'development';
      const config = getProviderConfig();

      expect(config.demoMode).toBe(true);
      expect(config.domain.provider).toBe('mock');
    });

    it('should use production providers when not in demo mode', () => {
      process.env.DEMO_MODE = 'false';
      process.env.NODE_ENV = 'production';
      const config = getProviderConfig();

      expect(config.demoMode).toBe(false);
      expect(config.domain.provider).toBe('dynadot');
      expect(config.leads.provider).toBe('google-places');
      expect(config.email.provider).toBe('website-scraper');
    });

    it('should include API keys from environment', () => {
      process.env.DYNADOT_ACCOUNT_API_KEY = 'test-dynadot-key';
      process.env.GOOGLE_MAPS_API_KEY = 'test-google-key';
      const config = getProviderConfig();

      expect(config.domain.apiKey).toBe('test-dynadot-key');
      expect(config.leads.apiKey).toBe('test-google-key');
    });
  });

  describe('initializeProviders', () => {
    it('should initialize all providers in demo mode', () => {
      const config = {
        domain: { provider: 'mock' as const },
        leads: { provider: 'mock' as const },
        email: { provider: 'mock' as const },
        demoMode: true,
      };

      const providers = initializeProviders(config);

      expect(providers.domainProvider.name).toBe('mock');
      expect(providers.leadProvider.name).toBe('mock');
      expect(providers.emailExtractor.name).toBe('mock');
    });

    it('should initialize providers with custom config', () => {
      const config = {
        domain: { provider: 'dynadot' as const, apiKey: 'test-key' },
        leads: { provider: 'google-places' as const, apiKey: 'test-key' },
        email: { provider: 'website-scraper' as const },
        demoMode: false,
      };

      const providers = initializeProviders(config);

      expect(providers.domainProvider.name).toBe('dynadot');
      expect(providers.leadProvider.name).toBe('google-places');
      expect(providers.emailExtractor.name).toBe('website-scraper');
    });
  });

  describe('checkProvidersHealth', () => {
    it('should check health of all providers', async () => {
      const config = {
        domain: { provider: 'mock' as const },
        leads: { provider: 'mock' as const },
        email: { provider: 'mock' as const },
        demoMode: true,
      };

      const health = await checkProvidersHealth(config);

      expect(health).toHaveLength(3);
      health.forEach(check => {
        expect(check.provider).toBeTruthy();
        expect(check.checkedAt).toBeInstanceOf(Date);
        expect(typeof check.healthy).toBe('boolean');
        expect(check.message).toBeTruthy();
      });
    });

    it('should report unhealthy provider on missing API key', async () => {
      const config = {
        domain: { provider: 'dynadot' as const },
        leads: { provider: 'google-places' as const },
        email: { provider: 'mock' as const },
        demoMode: false,
      };

      const health = await checkProvidersHealth(config);

      const domainCheck = health.find(h => h.provider.includes('domain'));
      expect(domainCheck?.healthy).toBe(false);
    });
  });

  describe('ProviderFallbackManager', () => {
    let manager: ProviderFallbackManager;

    beforeEach(() => {
      manager = new ProviderFallbackManager();
    });

    it('should track provider failures', () => {
      expect(manager.getFailureCount('test-provider')).toBe(0);
      
      manager.recordFailure('test-provider');
      expect(manager.getFailureCount('test-provider')).toBe(1);
      
      manager.recordFailure('test-provider');
      expect(manager.getFailureCount('test-provider')).toBe(2);
    });

    it('should trigger fallback after max failures', () => {
      expect(manager.shouldFallback('test-provider')).toBe(false);
      
      manager.recordFailure('test-provider');
      manager.recordFailure('test-provider');
      expect(manager.shouldFallback('test-provider')).toBe(false);
      
      manager.recordFailure('test-provider');
      expect(manager.shouldFallback('test-provider')).toBe(true);
    });

    it('should reset failure count', () => {
      manager.recordFailure('test-provider');
      manager.recordFailure('test-provider');
      expect(manager.getFailureCount('test-provider')).toBe(2);
      
      manager.reset('test-provider');
      expect(manager.getFailureCount('test-provider')).toBe(0);
    });

    it('should track different providers separately', () => {
      manager.recordFailure('provider-a');
      manager.recordFailure('provider-a');
      manager.recordFailure('provider-b');

      expect(manager.getFailureCount('provider-a')).toBe(2);
      expect(manager.getFailureCount('provider-b')).toBe(1);
    });
  });
});
