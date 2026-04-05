import { BaseLeadProvider } from './base';
import { LeadSearchParams, BusinessLeadSeed, BusinessLeadDetails } from '../types';

/**
 * Mock lead provider for demo mode
 * Returns realistic mock data based on search parameters
 */
export class MockLeadProvider extends BaseLeadProvider {
  name = 'mock';

  async searchBusinesses(params: LeadSearchParams): Promise<BusinessLeadSeed[]> {
    // Simulate network delay
    await this.delay(400 + Math.random() * 300);

    const { niche, city, state, maxResults = 20 } = params;

    // Generate mock businesses based on the search parameters
    const businesses: BusinessLeadSeed[] = [];
    const count = Math.min(maxResults, 5 + Math.floor(Math.random() * 10));

    const nicheKeywords = this.getNicheKeywords(niche);
    const businessSuffixes = ['Services', 'Pro', 'Solutions', 'Experts', 'Company', 'Group'];
    const cityAbbr = this.getCityAbbreviation(city);

    for (let i = 0; i < count; i++) {
      const name = this.generateBusinessName(nicheKeywords, city, cityAbbr, businessSuffixes, i);
      const hasWebsite = Math.random() > 0.3;
      const website = hasWebsite ? this.generateWebsite(name, city) : undefined;

      businesses.push({
        placeId: `mock_place_${city}_${niche}_${i}`,
        name,
        address: `${100 + i * 50} ${this.getStreetName(i)} St, ${city}, ${this.getStateAbbr(state)} ${10000 + i}`,
        city,
        state,
        phone: this.generatePhone(),
        website,
        rating: 3.5 + Math.random() * 1.5,
        reviewCount: Math.floor(Math.random() * 300),
      });
    }

    return businesses;
  }

  async getBusinessDetails(placeId: string): Promise<BusinessLeadDetails | null> {
    // Simulate network delay
    await this.delay(300 + Math.random() * 200);

    // Extract info from placeId
    const parts = placeId.split('_');
    if (parts[0] !== 'mock' || parts.length < 4) {
      return null;
    }

    const city = parts[2];
    const niche = parts[3];
    const index = parseInt(parts[4] || '0');

    const nicheKeywords = this.getNicheKeywords(niche);
    const name = this.generateBusinessName(nicheKeywords, city, this.getCityAbbreviation(city), ['Services'], index);
    const hasWebsite = Math.random() > 0.3;
    const website = hasWebsite ? this.generateWebsite(name, city) : undefined;
    const hasEmail = hasWebsite && Math.random() > 0.4;

    return {
      placeId,
      name,
      address: `${100 + index * 50} Main St, ${city}, XX ${10000 + index}`,
      city,
      state: 'State',
      phone: this.generatePhone(),
      website,
      email: hasEmail ? this.generateEmail(name) : undefined,
      currentDomain: website ? this.extractDomain(website) : undefined,
      rating: 3.5 + Math.random() * 1.5,
      reviewCount: Math.floor(Math.random() * 300),
      businessHours: {
        Monday: '9:00 AM - 5:00 PM',
        Tuesday: '9:00 AM - 5:00 PM',
        Wednesday: '9:00 AM - 5:00 PM',
        Thursday: '9:00 AM - 5:00 PM',
        Friday: '9:00 AM - 5:00 PM',
        Saturday: '10:00 AM - 2:00 PM',
        Sunday: 'Closed',
      },
      photos: [],
    };
  }

  private getNicheKeywords(niche: string): string[] {
    const keywords: Record<string, string[]> = {
      'car detailing': ['Auto', 'Car', 'Detailing', 'Shine', 'Polish', 'Clean'],
      'roofing': ['Roof', 'Roofing', 'Repair', 'Construction', 'Building'],
      'hvac': ['HVAC', 'Air', 'Heating', 'Cooling', 'Climate', 'Comfort'],
      'plumbing': ['Plumbing', 'Plumber', 'Pipe', 'Water', 'Drain'],
      'landscaping': ['Landscape', 'Lawn', 'Garden', 'Green', 'Yard'],
    };

    return keywords[niche.toLowerCase()] || ['Professional', 'Quality', 'Expert'];
  }

  private generateBusinessName(keywords: string[], city: string, cityAbbr: string, suffixes: string[], index: number): string {
    const templates = [
      `${city} ${keywords[index % keywords.length]} ${suffixes[index % suffixes.length]}`,
      `${keywords[index % keywords.length]} ${suffixes[index % suffixes.length]}`,
      `${cityAbbr} ${keywords[index % keywords.length]}`,
      `${keywords[index % keywords.length]} ${keywords[(index + 1) % keywords.length]}`,
    ];

    return templates[index % templates.length];
  }

  private generateWebsite(businessName: string, city: string): string {
    const useSubdomain = Math.random() < 0.25;
    const platforms = ['wixsite.com', 'squarespace.com', 'weebly.com', 'godaddysites.com'];
    
    if (useSubdomain) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const slug = businessName.toLowerCase().replace(/\s+/g, '');
      return `${slug}.${platform}`;
    }

    const domain = businessName.toLowerCase().replace(/\s+/g, '') + city.toLowerCase();
    return `${domain}.com`;
  }

  private generateEmail(businessName: string): string {
    const prefixes = ['info', 'contact', 'hello', 'service'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const domain = businessName.toLowerCase().replace(/\s+/g, '');
    return `${prefix}@${domain}.com`;
  }

  private generatePhone(): string {
    const areaCode = 200 + Math.floor(Math.random() * 700);
    const exchange = 200 + Math.floor(Math.random() * 700);
    const subscriber = 1000 + Math.floor(Math.random() * 9000);
    return `(${areaCode}) ${exchange}-${subscriber}`;
  }

  private getCityAbbreviation(city: string): string {
    const abbrs: Record<string, string> = {
      'Richmond': 'RVA',
      'Tampa': 'TPA',
      'Phoenix': 'PHX',
      'New York': 'NYC',
      'Los Angeles': 'LA',
      'San Francisco': 'SF',
    };

    return abbrs[city] || city.substring(0, 3).toUpperCase();
  }

  private getStateAbbr(state: string): string {
    const abbrs: Record<string, string> = {
      'Virginia': 'VA',
      'Florida': 'FL',
      'Arizona': 'AZ',
      'California': 'CA',
      'New York': 'NY',
      'Texas': 'TX',
    };

    return abbrs[state] || state.substring(0, 2).toUpperCase();
  }

  private getStreetName(index: number): string {
    const streets = ['Main', 'Broad', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Washington', 'Jefferson', 'Lincoln'];
    return streets[index % streets.length];
  }
}
