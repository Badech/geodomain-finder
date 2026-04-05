import { BaseLeadProvider } from './base';
import { LeadSearchParams, BusinessLeadSeed, BusinessLeadDetails, ProviderError, RateLimitError } from '../types';

/**
 * Google Places API provider
 * Uses Google Places API (New) for business lead generation
 * API Docs: https://developers.google.com/maps/documentation/places/web-service/overview
 */
export class GooglePlacesProvider extends BaseLeadProvider {
  name = 'google-places';
  private apiKey: string;
  private baseUrl = 'https://places.googleapis.com/v1';
  private requestDelay = 200; // Small delay between requests

  constructor(apiKey: string) {
    super();
    if (!apiKey) {
      throw new Error('Google Places API key is required');
    }
    this.apiKey = apiKey;
  }

  async searchBusinesses(params: LeadSearchParams): Promise<BusinessLeadSeed[]> {
    const { niche, city, state, maxResults = 20 } = params;

    try {
      // Use Text Search to find businesses
      const query = `${niche} in ${city}, ${state}`;
      const url = `${this.baseUrl}/places:searchText`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.location',
        },
        body: JSON.stringify({
          textQuery: query,
          maxResultCount: Math.min(maxResults, 20), // API limit is 20
          languageCode: 'en',
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new RateLimitError(this.name, 60);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new ProviderError(
          `Google Places API request failed: ${response.status} ${response.statusText}`,
          this.name
        );
      }

      const data = await response.json();
      const places = data.places || [];

      return places.map((place: any) => this.mapToBusinessLeadSeed(place, city, state));
    } catch (error) {
      if (error instanceof ProviderError || error instanceof RateLimitError) {
        throw error;
      }
      throw new ProviderError(
        `Failed to search businesses: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  async getBusinessDetails(placeId: string): Promise<BusinessLeadDetails | null> {
    try {
      // Use Place Details to get full business information
      const url = `${this.baseUrl}/places/${placeId}`;

      await this.delay(this.requestDelay);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,nationalPhoneNumber,websiteUri,rating,userRatingCount,location,currentOpeningHours,photos,addressComponents',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        if (response.status === 429) {
          throw new RateLimitError(this.name, 60);
        }
        throw new ProviderError(
          `Google Places API request failed: ${response.status} ${response.statusText}`,
          this.name
        );
      }

      const place = await response.json();
      return this.mapToBusinessLeadDetails(place);
    } catch (error) {
      if (error instanceof ProviderError || error instanceof RateLimitError) {
        throw error;
      }
      throw new ProviderError(
        `Failed to get business details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  private mapToBusinessLeadSeed(place: any, city: string, state: string): BusinessLeadSeed {
    return {
      placeId: place.id,
      name: place.displayName?.text || 'Unknown Business',
      address: place.formattedAddress || '',
      city,
      state,
      phone: place.nationalPhoneNumber ? this.normalizePhone(place.nationalPhoneNumber) : undefined,
      website: place.websiteUri ? this.extractDomain(place.websiteUri) : undefined,
      rating: place.rating || undefined,
      reviewCount: place.userRatingCount || undefined,
    };
  }

  private mapToBusinessLeadDetails(place: any): BusinessLeadDetails {
    const addressComponents = place.addressComponents || [];
    const city = this.extractAddressComponent(addressComponents, 'locality') || '';
    const state = this.extractAddressComponent(addressComponents, 'administrative_area_level_1') || '';

    const website = place.websiteUri;
    const details: BusinessLeadDetails = {
      placeId: place.id,
      name: place.displayName?.text || 'Unknown Business',
      address: place.formattedAddress || '',
      city,
      state,
      phone: place.nationalPhoneNumber ? this.normalizePhone(place.nationalPhoneNumber) : undefined,
      website: website ? this.extractDomain(website) : undefined,
      currentDomain: website ? this.extractDomain(website) : undefined,
      rating: place.rating || undefined,
      reviewCount: place.userRatingCount || undefined,
    };

    // Add business hours if available
    if (place.currentOpeningHours?.weekdayDescriptions) {
      details.businessHours = this.parseBusinessHours(place.currentOpeningHours.weekdayDescriptions);
    }

    // Add photos if available
    if (place.photos && place.photos.length > 0) {
      details.photos = place.photos.slice(0, 5).map((photo: any) => photo.name);
    }

    return details;
  }

  private extractAddressComponent(components: any[], type: string): string | null {
    const component = components.find((c: any) => c.types?.includes(type));
    return component?.longText || component?.shortText || null;
  }

  private parseBusinessHours(descriptions: string[]): Record<string, string> {
    const hours: Record<string, string> = {};
    
    for (const desc of descriptions) {
      // Format: "Monday: 9:00 AM – 5:00 PM"
      const match = desc.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        hours[match[1]] = match[2];
      }
    }

    return hours;
  }
}
